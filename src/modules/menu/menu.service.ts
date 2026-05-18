import { MenuItem, Prisma } from "@prisma/client";
import status from "http-status";
import ApiError from "../../errors/ApiError";
import prisma from "../../config/db";
import { IOptions, calculatePagination } from "../../utils/pagination";
import { IMenuFilterRequest } from "./menu.interface";
import { menuSearchableFields } from "./menu.constant";

export class MenuService {
  async createMenuItem(payload: Partial<MenuItem>): Promise<MenuItem> {
    const category = await prisma.category.findUnique({
      where: {
        id_restaurantId: {
          id: payload.categoryId as string,
          restaurantId: payload.restaurantId as string,
        },
      },
    });

    if (!category) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Invalid categoryId. The category does not exist in your restaurant.",
      );
    }

    const result = await prisma.menuItem.create({
      data: payload as MenuItem,
      include: {
        category: true,
      },
    });
    return result;
  }

  async getAllMenuItems(
    filters: IMenuFilterRequest,
    options: IOptions,
    restaurantId: string,
  ) {
    const { limit, page, skip, sortBy, sortOrder } = calculatePagination(options);
    const { searchTerm, isAvailable, ...filterData } = filters;

    const andConditions: Prisma.MenuItemWhereInput[] = [];

    andConditions.push({ restaurantId });

    if (searchTerm) {
      andConditions.push({
        OR: menuSearchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        })),
      });
    }

    if (isAvailable !== undefined) {
      andConditions.push({
        isAvailable: isAvailable === "true",
      });
    }

    if (Object.keys(filterData).length > 0) {
      andConditions.push({
        AND: Object.keys(filterData).map((key) => ({
          [key]: {
            equals: (filterData as any)[key],
          },
        })),
      });
    }

    const whereConditions: Prisma.MenuItemWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.menuItem.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        [sortBy]: sortOrder,
      },
      include: {
        category: true,
      },
    });

    const total = await prisma.menuItem.count({
      where: whereConditions,
    });

    return {
      meta: {
        total,
        page,
        limit,
      },
      data: result,
    };
  }

  async updateMenuItem(
    id: string,
    restaurantId: string,
    payload: Partial<MenuItem>,
  ): Promise<MenuItem> {
    const isExist = await prisma.menuItem.findUnique({
      where: {
        id_restaurantId: {
          id,
          restaurantId,
        },
      },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "Menu item not found");
    }

    if (payload.categoryId) {
      const category = await prisma.category.findUnique({
        where: {
          id_restaurantId: {
            id: payload.categoryId,
            restaurantId,
          },
        },
      });

      if (!category) {
        throw new ApiError(
          status.BAD_REQUEST,
          "Invalid categoryId. The category does not exist in your restaurant.",
        );
      }
    }

    const result = await prisma.menuItem.update({
      where: { id },
      data: payload,
      include: {
        category: true,
      },
    });

    return result;
  }

  async deleteMenuItem(id: string, restaurantId: string): Promise<MenuItem> {
    const isExist = await prisma.menuItem.findUnique({
      where: {
        id_restaurantId: {
          id,
          restaurantId,
        },
      },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "Menu item not found");
    }

    const result = await prisma.menuItem.delete({
      where: { id },
    });

    return result;
  }
}
