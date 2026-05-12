import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private authService: AuthService = new AuthService()) {}

  loginSystem = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.loginSystem(email, password);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "System Admin logged in successfully",
      data: result,
    });
  });

  loginUser = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.loginUser(email, password);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Restaurant User logged in successfully",
      data: result,
    });
  });

  systemMe = catchAsync(async (req: Request, res: Response) => {
    const result = await this.authService.getSystemMe(req.user.userId as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "System Admin profile retrieved successfully",
      data: result,
    });
  });

  userMe = catchAsync(async (req: Request, res: Response) => {
    const result = await this.authService.getUserMe(req.user.userId as string);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Restaurant User profile retrieved successfully",
      data: result,
    });
  });
}
