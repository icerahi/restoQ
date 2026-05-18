import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { queryOptions } from "../../utils/pagination";
import { pick } from "../../utils/pick";
import { sendResponse } from "../../utils/sendResponse";
import { restaurantFilterableFields } from "./restaurant.constant";
import { RestaurantService } from "./restaurant.service";

export class RestaurantController {
  constructor(
    private restaurantService: RestaurantService = new RestaurantService(),
  ) {}

  createRestaurant = catchAsync(async (req: Request, res: Response) => {
    const result = await this.restaurantService.createRestaurant(
      req.body,
      req.user?.userId,
    );

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Restaurant created successfully",
      data: result,
    });
  });

  listRestaurants = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, restaurantFilterableFields);
    const options = pick(req.query, queryOptions);

    const result = await this.restaurantService.listRestaurants(
      filters,
      options,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Restaurants retrieved successfully",
      data: result,
    });
  });

  getRestaurant = catchAsync(async (req: Request, res: Response) => {
    const result = await this.restaurantService.getRestaurantById(
      req.params["id"] as string,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Restaurant details retrieved successfully",
      data: result,
    });
  });

  updateRestaurant = catchAsync(async (req: Request, res: Response) => {
    const result = await this.restaurantService.updateRestaurant(
      req.params["id"] as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Restaurant updated successfully",
      data: result,
    });
  });

  deleteRestaurant = catchAsync(async (req: Request, res: Response) => {
    const result = await this.restaurantService.deleteRestaurant(
      req.params["id"] as string,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Restaurant deleted successfully",
      data: result,
    });
  });

  getMyRestaurant = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId;

    const result = await this.restaurantService.getRestaurantById(
      restaurantId as string,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Your Restaurant Info retrieved successfully",
      data: result,
    });
  });

  updateMyRestaurant = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId;

    const result = await this.restaurantService.updateRestaurant(
      restaurantId as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Your Restaurant Info Updated successfully",
      data: result,
    });
  });
}
