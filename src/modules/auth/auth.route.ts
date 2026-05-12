import { SystemRole } from "@prisma/client";
import { Router } from "express";
import { authSystem } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { AuthController } from "./auth.controller";
import { loginSchema } from "./auth.validation";

const router = Router();
const authController = new AuthController();

router.post("/login", validateRequest(loginSchema), authController.login);
router.get(
  "/me",
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]),
  authController.me,
);

export const authRoutes = router;
