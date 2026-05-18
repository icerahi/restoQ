import { Prisma, Role, SystemRole } from "@prisma/client";
import bcrypt from "bcryptjs";
import status from "http-status";
import { JwtPayload } from "jsonwebtoken";
import prisma from "../../config/db";
import { env } from "../../config/env";
import ApiError from "../../errors/ApiError";
import { calculatePagination } from "../../utils/pagination";
import {
  systemUserSearchableFields,
  tenantUserSearchableFields,
} from "./user.constant";

export class UserService {
  // ==================== SYSTEM USER MANAGEMENT ====================

  async createSystemUser(data: Prisma.SystemUserCreateInput) {
    const isEmailTaken = await prisma.systemUser.findUnique({
      where: { email: data.email },
    });

    if (isEmailTaken) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Email is already in use by another system user",
      );
    }

    const hashedPassword = await bcrypt.hash(
      data.password,
      env.bcrypt_salt_rounds,
    );

    const user = await prisma.systemUser.create({
      data: {
        ...data,
        password: hashedPassword,
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async getAllSystemUsers(filters: any, options: any) {
    const { page, limit, skip, sortBy, sortOrder } =
      calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.SystemUserWhereInput[] = [];

    if (searchTerm) {
      andConditions.push({
        OR: systemUserSearchableFields.map((field) => ({
          [field]: { contains: searchTerm, mode: "insensitive" },
        })),
      });
    }

    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        AND: Object.keys(filterData).map((key) => {
          let value = (filterData as any)[key];
          if (value === "true") value = true;
          else if (value === "false") value = false;
          return { [key]: { equals: value } };
        }),
      });
    }

    const whereConditions: Prisma.SystemUserWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.systemUser.findMany({
      where: whereConditions,
      take: limit,
      skip,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
      },
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await prisma.systemUser.count({ where: whereConditions });
    const totalPages = Math.ceil(total / limit);

    return { meta: { page, limit, total, totalPages }, data: result };
  }

  async getSystemUserById(id: string) {
    const user = await prisma.systemUser.findUnique({
      where: { id },
    });

    if (!user) throw new ApiError(status.NOT_FOUND, "System user not found");

    const { password, ...result } = user;
    return result;
  }

  async updateSystemUser(id: string, data: Prisma.SystemUserUpdateInput) {
    const user = await this.getSystemUserById(id);

    if (data.password) {
      data.password = await bcrypt.hash(
        data.password as string,
        env.bcrypt_salt_rounds,
      );
    }

    const updated = await prisma.systemUser.update({
      where: { id: user.id },
      data,
    });

    const { password, ...result } = updated;
    return result;
  }

  async deleteSystemUser(id: string) {
    const user = await this.getSystemUserById(id);

    await prisma.systemUser.delete({
      where: { id: user.id },
    });

    return { id: user.id, message: "System user deleted successfully" };
  }

  //========================= TENANT USER MANAGEMENT============================

  async getAllUsers(filters: any, options: any, restaurantId?: string) {
    const { page, limit, skip, sortBy, sortOrder } =
      calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.UserWhereInput[] = [];

    if (searchTerm) {
      andConditions.push({
        OR: tenantUserSearchableFields.map((field) => ({
          [field]: { contains: searchTerm, mode: "insensitive" },
        })),
      });
    }

    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        AND: Object.keys(filterData).map((key) => {
          let value = (filterData as any)[key];
          if (value === "true") value = true;
          else if (value === "false") value = false;
          return { [key]: { equals: value } };
        }),
      });
    }

    if (restaurantId) {
      andConditions.push({ restaurantId });
    }

    const whereConditions: Prisma.UserWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.user.findMany({
      where: whereConditions,
      take: limit,
      skip,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        restaurant: {
          select: { id: true, name: true },
        },
      },
      orderBy: { [sortBy]: sortOrder },
    });

    const total = await prisma.user.count({ where: whereConditions });
    const totalPages = Math.ceil(total / limit);

    return { meta: { page, limit, total, totalPages }, data: result };
  }

  async getUserById(id: string, restaurantId?: string) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        ...(restaurantId ? { restaurantId } : {}),
      },
      include: {
        restaurant: {
          select: { name: true },
        },
      },
    });

    if (!user) throw new ApiError(status.NOT_FOUND, "User not found");

    const { password, ...result } = user;
    return result;
  }

  async updateUser(
    id: string,
    data: Prisma.UserUpdateInput,
    requestUser: JwtPayload,
    restaurantId?: string,
  ) {
    const user = await this.getUserById(id, restaurantId);

    if (data.password) {
      data.password = await bcrypt.hash(
        data.password as string,
        env.bcrypt_salt_rounds,
      );
    }

    if (!Object.values(SystemRole).includes(requestUser.role as SystemRole)) {
      if (data.role) {
        if (user.role === Role.OWNER && data.role !== Role.OWNER) {
          throw new ApiError(
            status.FORBIDDEN,
            "To change role of an OWNER, please contact us.",
          );
        }

        if (user.role !== Role.OWNER && data.role === Role.OWNER) {
          throw new ApiError(
            status.FORBIDDEN,
            "To change the role to OWNER, please contact us.",
          );
        }
      }
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    const { password, ...result } = updated;
    return result;
  }

  async deleteUser(id: string, requestUser: JwtPayload, restaurantId?: string) {
    const user = await this.getUserById(id, restaurantId);

    if (!Object.values(SystemRole).includes(requestUser.role as SystemRole)) {
      if (user.role === Role.OWNER) {
        throw new ApiError(
          status.BAD_REQUEST,
          "To delete role of OWNER, please contact us.",
        );
      }
    }

    await prisma.user.delete({
      where: { id: user.id },
    });

    return { id: user.id, message: "User deleted successfully" };
  }

  async createUser(data: Prisma.UserUncheckedCreateInput) {
    if (data.role === Role.OWNER) {
      throw new ApiError(
        status.BAD_REQUEST,
        "To create a new OWNER, please contact us.",
      );
    }

    const isEmailTaken = await prisma.user.findFirst({
      where: {
        email: data.email,
        restaurantId: data.restaurantId,
      },
    });

    if (isEmailTaken) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Email is already registered in this system",
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      data.password,
      env.bcrypt_salt_rounds,
    );

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      include: {
        restaurant: {
          select: { name: true },
        },
      },
    });

    const { password, ...result } = user;
    return result;
  }
}
