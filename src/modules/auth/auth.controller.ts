import { Request, Response } from "express";
import status from "http-status";
import { catchAsync } from "../../utils/catchAsync";
import { sendResponse } from "../../utils/sendResponse";
import { AuthService } from "./auth.service";

export class AuthController {
  constructor(private authService: AuthService = new AuthService()) {}

  login = catchAsync(async (req: Request, res: Response) => {
    const { email, password } = req.body;
    const result = await this.authService.login(email, password);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "User logged in successfully",
      data: result,
    });
  });

  me = catchAsync(async (req: Request, res: Response) => {
    const isSystemUser = !!req.user.globalRole;
    const result = await this.authService.getMe(req.user.userId, isSystemUser);

    sendResponse(res, {
      statusCode: status.OK,
      success: true,
      message: "Profile retrieved successfully",
      data: result
    });
  });
}
