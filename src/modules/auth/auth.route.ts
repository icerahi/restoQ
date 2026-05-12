import { Role, SystemRole } from "@prisma/client";
import { Router } from "express";
import { auth, authSystem } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { loginSchema } from "./auth.validation";

const router = Router();
const authController = new AuthController();

router.post(
  "/system/login",
  validateRequest(loginSchema),
  authController.loginSystem,
);
router.post(
  "/user/login",
  validateRequest(loginSchema),
  authController.loginUser,
);

router.get(
  "/system/me",
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]),
  authController.systemMe,
);

router.get("/user/me", auth([]), authController.userMe);

export const authRoutes = router;
