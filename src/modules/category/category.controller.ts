import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { queryOptions } from "../../utils/pagination";
import { pick } from "../../utils/pick";
import { sendResponse } from "../../utils/sendResponse";
import { categoryFilterableFields } from "./category.constant";
import { CategoryService } from "./category.service";

export class CategoryController {
  private categoryService: CategoryService;

  constructor() {
    this.categoryService = new CategoryService();
  }

  createCategory = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const result = await this.categoryService.createCategory({
      ...req.body,
      restaurantId,
    });

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Category created successfully",
      data: result,
    });
  });

  getAllCategories = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const filters = pick(req.query, categoryFilterableFields);
    const options = pick(req.query, queryOptions);

    const result = await this.categoryService.getAllCategories(
      filters,
      options,
      restaurantId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Categories retrieved successfully",
      data: result,
    });
  });

  getCategoryById = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const id = req.params.id as string;

    const result = await this.categoryService.getCategoryById(id, restaurantId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category retrieved successfully",
      data: result,
    });
  });

  updateCategory = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const id = req.params.id as string;

    const result = await this.categoryService.updateCategory(id, restaurantId, req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category updated successfully",
      data: result,
    });
  });

  deleteCategory = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const id = req.params.id as string;

    await this.categoryService.deleteCategory(id, restaurantId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Category deleted successfully",
      data: null,
    });
  });
}
