import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { UserService } from "./user.service";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  createStaff = catchAsync(async (req: Request, res: Response) => {
    // tenantId is injected by the 'auth' middleware
    const restaurantId = req.tenantId as string;

    const result = await this.userService.createUser({
      ...req.body,
      restaurantId,
    });

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "Staff member created successfully",
      data: result,
    });
  });

  getUsers = catchAsync(async (req: Request, res: Response) => {
    // If it's a System Admin, tenantId might be missing unless they are in God Mode
    const restaurantId = req.tenantId;

    const result = await this.userService.getAllUsers(restaurantId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Users retrieved successfully",
      data: result,
    });
  });

  getUserDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const restaurantId = req.tenantId;

    const result = await this.userService.getUserById(id as string, restaurantId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User details retrieved successfully",
      data: result,
    });
  });

  updateUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const restaurantId = req.tenantId;

    const result = await this.userService.updateUser(id as string, req.body, restaurantId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User updated successfully",
      data: result,
    });
  });

  deleteUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const restaurantId = req.tenantId;

    const result = await this.userService.deleteUser(id as string, restaurantId);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  });
}
