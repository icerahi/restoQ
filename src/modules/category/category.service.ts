import { Category, Prisma } from "@prisma/client";
import status from "http-status";
import prisma from "../../config/db";
import ApiError from "../../errors/ApiError";
import { IOptions, calculatePagination } from "../../utils/pagination";
import { categorySearchableFields } from "./category.constant";
import { ICategoryFilterRequest } from "./category.interface";

export class CategoryService {
  async createCategory(payload: Partial<Category>): Promise<Category> {
    const existing = await prisma.category.findUnique({
      where: {
        name_restaurantId: {
          name: payload.name as string,
          restaurantId: payload.restaurantId as string,
        },
      },
    });

    if (existing) {
      throw new ApiError(
        status.BAD_REQUEST,
        `Category '${payload.name}' already exists in your restaurant.`,
      );
    }
    const result = await prisma.category.create({
      data: payload as Category,
    });
    return result;
  }

  async getAllCategories(
    filters: ICategoryFilterRequest,
    options: IOptions,
    restaurantId: string,
  ) {
    const { limit, page, skip } = calculatePagination(options);
    const { searchTerm, ...filterData } = filters;

    const andConditions: Prisma.CategoryWhereInput[] = [];

    andConditions.push({ restaurantId });

    if (searchTerm) {
      andConditions.push({
        OR: categorySearchableFields.map((field) => ({
          [field]: {
            contains: searchTerm,
            mode: "insensitive",
          },
        })),
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

    const whereConditions: Prisma.CategoryWhereInput =
      andConditions.length > 0 ? { AND: andConditions } : {};

    const result = await prisma.category.findMany({
      where: whereConditions,
      skip,
      take: limit,
      orderBy: {
        sortOrder: "asc",
      },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });

    const total = await prisma.category.count({
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

  async getCategoryById(
    id: string,
    restaurantId: string,
  ): Promise<Category | null> {
    const result = await prisma.category.findUnique({
      where: {
        id_restaurantId: {
          id,
          restaurantId,
        },
      },
      include: {
        menuItems: true,
      },
    });

    if (!result) {
      throw new ApiError(status.NOT_FOUND, "Category not found");
    }

    return result;
  }

  async updateCategory(
    id: string,
    restaurantId: string,
    payload: Partial<Category>,
  ): Promise<Category> {
    const isExist = await prisma.category.findUnique({
      where: {
        id_restaurantId: {
          id,
          restaurantId,
        },
      },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "Category not found");
    }

    if (payload.name && payload.name !== isExist.name) {
      const existingName = await prisma.category.findUnique({
        where: {
          name_restaurantId: {
            name: payload.name,
            restaurantId,
          },
        },
      });
      if (existingName) {
        throw new ApiError(
          status.BAD_REQUEST,
          `Category '${payload.name}' already exists.`,
        );
      }
    }

    const result = await prisma.category.update({
      where: { id },
      data: payload,
    });

    return result;
  }

  async deleteCategory(id: string, restaurantId: string): Promise<Category> {
    const isExist = await prisma.category.findUnique({
      where: {
        id_restaurantId: {
          id,
          restaurantId,
        },
      },
      include: {
        _count: {
          select: { menuItems: true },
        },
      },
    });

    if (!isExist) {
      throw new ApiError(status.NOT_FOUND, "Category not found");
    }

    if (isExist._count.menuItems > 0) {
      throw new ApiError(
        status.BAD_REQUEST,
        "Cannot delete category because it contains menu items. Please remove or reassign them first.",
      );
    }

    const result = await prisma.category.delete({
      where: { id },
    });

    return result;
  }
}
