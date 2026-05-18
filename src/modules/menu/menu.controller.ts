import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { queryOptions } from "../../utils/pagination";
import { pick } from "../../utils/pick";
import { sendResponse } from "../../utils/sendResponse";
import { menuFilterableFields } from "./menu.constant";
import { MenuService } from "./menu.service";

export class MenuController {
  private menuService: MenuService;

  constructor() {
    this.menuService = new MenuService();
  }

  createMenuItem = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const result = await this.menuService.createMenuItem({
      ...req.body,
      restaurantId,
    });

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Menu item created successfully",
      data: result,
    });
  });

  getAllMenuItems = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const filters = pick(req.query, menuFilterableFields);
    const options = pick(req.query, queryOptions);

    const result = await this.menuService.getAllMenuItems(
      filters,
      options,
      restaurantId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Menu items retrieved successfully",
      data: result,
    });
  });

  getMenuItemById = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const id = req.params.id as string;

    const result = await this.menuService.getMenuItemById(id, restaurantId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Menu item retrieved successfully",
      data: result,
    });
  });

  updateMenuItem = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const id = req.params.id as string;

    const result = await this.menuService.updateMenuItem(id, restaurantId, req.body);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Menu item updated successfully",
      data: result,
    });
  });

  deleteMenuItem = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId as string;
    const id = req.params.id as string;

    await this.menuService.deleteMenuItem(id, restaurantId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Menu item deleted successfully",
      data: null,
    });
  });
}
