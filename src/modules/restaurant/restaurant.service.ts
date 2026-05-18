import { Prisma, Role } from "@prisma/client";
import bcrypt from "bcryptjs";
import status from "http-status";
import prisma from "../../config/db";
import { env } from "../../config/env";
import ApiError from "../../errors/ApiError";
import { calculatePagination } from "../../utils/pagination";
import { restaurantSearchableFields } from "./restaurant.constant";

export class RestaurantService {
  async createRestaurant(data: any, createdById: string) {
    // Validate if the owner's email already exists
    const existingOwner = await prisma.user.findUnique({
      where: { email: data.owner.email },
    });

    if (existingOwner) {
      throw new ApiError(status.CONFLICT, "Owner email is already registered");
    }

    const hashedPassword = await bcrypt.hash(
      data.owner.password,
      env.bcrypt_salt_rounds,
    );

    const result = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          ...data.restaurant,
          createdById: createdById,
        },
      });

      const owner = await tx.user.create({
        data: {
          ...data.owner,
          password: hashedPassword,
          role: Role.OWNER,
          restaurantId: restaurant.id,
        },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      });

      return { restaurant, owner };
    });

    console.log({ result });

    return result;
  }

  async listRestaurants(filters: any, options: any) {
    const { page, limit, skip, sortBy, sortOrder } =
      calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.RestaurantWhereInput[] = [];

    if (searchTerm) {
      andConditions.push({
        OR: restaurantSearchableFields.map((field) => ({
          [field]: { contains: searchTerm, mode: "insensitive" },
        })),
      });
    }

    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        AND: Object.keys(filterData).map((key) => {
          let value = (filterData as any)[key];

          if (value === "true") {
            value = true;
          } else if (value === "false") {
            value = false;
          }

          return {
            [key]: { equals: value },
          };
        }),
      });
    }

    const whereConditions: Prisma.RestaurantWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.restaurant.findMany({
      where: whereConditions,
      take: limit,
      skip,
      orderBy: { [sortBy]: sortOrder },
      include: {
        _count: {
          select: { users: true, tables: true },
        },
      },
    });

    const total = await prisma.restaurant.count({ where: whereConditions });
    const totalPages = Math.ceil(total / limit);

    return { meta: { page, limit, total, totalPages }, data: result };
  }

  async getRestaurantById(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true },
        },
        _count: {
          select: { categories: true, menuItems: true, tables: true },
        },
      },
    });

    if (!restaurant) {
      throw new ApiError(status.NOT_FOUND, "Restaurant not found");
    }

    return restaurant;
  }

  async updateRestaurant(id: string, data: any) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new ApiError(status.NOT_FOUND, "Restaurant not found");
    }

    return await prisma.restaurant.update({
      where: { id },
      data,
    });
  }

  async deleteRestaurant(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
    });

    if (!restaurant) {
      throw new ApiError(status.NOT_FOUND, "Restaurant not found");
    }

    await prisma.$transaction(async (tx) => {
      // 1. Delete OrderItem
      await tx.orderItem.deleteMany({
        where: {
          order: {
            restaurantId: id,
          },
        },
      });

      // 2. Delete Order
      await tx.order.deleteMany({
        where: { restaurantId: id },
      });

      // 3. Delete TableSession
      await tx.tableSession.deleteMany({
        where: { restaurantId: id },
      });

      // 4. Delete Table
      await tx.table.deleteMany({
        where: { restaurantId: id },
      });

      // 5. Delete MenuItem
      await tx.menuItem.deleteMany({
        where: { restaurantId: id },
      });

      // 6. Delete Category
      await tx.category.deleteMany({
        where: { restaurantId: id },
      });

      // 7. Delete Expense
      await tx.expense.deleteMany({
        where: { restaurantId: id },
      });

      // 8. Delete User
      await tx.user.deleteMany({
        where: { restaurantId: id },
      });

      // 9. Delete Restaurant
      await tx.restaurant.delete({
        where: { id },
      });
    });

    return { id };
  }
}
