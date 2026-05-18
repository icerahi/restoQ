import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { queryOptions } from "../../utils/pagination";
import { pick } from "../../utils/pick";
import { sendResponse } from "../../utils/sendResponse";
import {
  systemUserFilterableFields,
  tenantUserFilterableFields,
} from "./user.constant";
import { UserService } from "./user.service";

export class UserController {
  private userService: UserService;

  constructor() {
    this.userService = new UserService();
  }

  // ==================== SYSTEM USER MANAGEMENT ====================

  createSystemUser = catchAsync(async (req: Request, res: Response) => {
    const result = await this.userService.createSystemUser(req.body);

    sendResponse(res, {
      statusCode: status.CREATED,
      success: true,
      message: "System user created successfully",
      data: result,
    });
  });

  getSystemUsers = catchAsync(async (req: Request, res: Response) => {
    const filters = pick(req.query, systemUserFilterableFields);
    const options = pick(req.query, queryOptions);

    const result = await this.userService.getAllSystemUsers(filters, options);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "System users retrieved successfully",
      data: result,
    });
  });

  getSystemUserDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.userService.getSystemUserById(id as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "System user details retrieved successfully",
      data: result,
    });
  });

  updateSystemUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.userService.updateSystemUser(
      id as string,
      req.body,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "System user updated successfully",
      data: result,
    });
  });

  deleteSystemUser = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;

    const result = await this.userService.deleteSystemUser(id as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "System user deleted successfully",
      data: result,
    });
  });

  getTenantUsers = catchAsync(async (req: Request, res: Response) => {
    const { tenantId } = req.query;

    const filters = pick(req.query, tenantUserFilterableFields);
    const options = pick(req.query, queryOptions);

    const result = await this.userService.getAllUsers(
      filters,
      options,
      tenantId ? (tenantId as string) : undefined,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Tenant users retrieved successfully",
      data: result,
    });
  });

  // ==================== TENANT USER MANAGEMENT ====================

  createUsers = catchAsync(async (req: Request, res: Response) => {
    // tenantId is injected by the 'authTenant' middleware
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

  getUsersMe = catchAsync(async (req: Request, res: Response) => {
    const restaurantId = req.tenantId;

    const filters = pick(req.query, tenantUserFilterableFields);
    const options = pick(req.query, queryOptions);

    const result = await this.userService.getAllUsers(
      filters,
      options,
      restaurantId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Your restaurant users retrieved successfully",
      data: result,
    });
  });

  getUserDetails = catchAsync(async (req: Request, res: Response) => {
    const { id } = req.params;
    const restaurantId = req.tenantId;

    const result = await this.userService.getUserById(
      id as string,
      restaurantId,
    );

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

    const result = await this.userService.updateUser(
      id as string,
      req.body,
      req.user,
      restaurantId,
    );

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

    const result = await this.userService.deleteUser(
      id as string,
      req.user,
      restaurantId,
    );

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User deleted successfully",
      data: result,
    });
  });
}
