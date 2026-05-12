import { Prisma, Role, User } from "@prisma/client";
import bcrypt from "bcryptjs";
import status from "http-status";
import prisma from "../../config/db";
import ApiError from "../../errors/ApiError";

export class UserService {
  async createUser(data: Prisma.UserUncheckedCreateInput) {
    const isEmailTaken = await prisma.user.findFirst({
      where: {
        email: data.email,
        restaurantId: data.restaurantId,
      },
    });

    if (isEmailTaken) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Email is already registered in this restaurant",
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    const user = await prisma.user.create({
      data: {
        ...data,
        password: hashedPassword,
      },
      include: {
        restaurant: {
          select: { name: true, slug: true },
        },
      },
    });

    const { password, ...result } = user;
    return result;
  }

  async getAllUsers(restaurantId?: string) {
    const where: Prisma.UserWhereInput = restaurantId ? { restaurantId } : {};

    return await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        createdAt: true,
        restaurant: {
          select: { id: true, name: true, slug: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async getUserById(id: string, restaurantId?: string) {
    const user = await prisma.user.findFirst({
      where: {
        id,
        ...(restaurantId ? { restaurantId } : {}),
      },
      include: {
        restaurant: {
          select: { name: true, slug: true },
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
    restaurantId?: string,
  ) {
    const user = await this.getUserById(id, restaurantId);

    if (data.password) {
      data.password = await bcrypt.hash(data.password as string, 10);
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data,
    });

    const { password, ...result } = updated;
    return result;
  }

  async deleteUser(id: string, restaurantId?: string) {
    const user = await this.getUserById(id, restaurantId);

    await prisma.user.delete({
      where: { id: user.id },
    });

    return { id: user.id, message: "User deleted successfully" };
  }
}
