import { Role } from "@prisma/client";
import { Router } from "express";
import { authTenant } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { MenuController } from "./menu.controller";
import { createMenuSchema, updateMenuSchema } from "./menu.validation";

const router = Router();
const menuController = new MenuController();

router.post(
  "/",
  authTenant([Role.OWNER, Role.MANAGER]),
  validateRequest(createMenuSchema),
  menuController.createMenuItem,
);

router.get("/", authTenant([]), menuController.getAllMenuItems);

router.patch(
  "/:id",
  authTenant([Role.OWNER, Role.MANAGER, Role.CHEF]),
  validateRequest(updateMenuSchema),
  menuController.updateMenuItem,
);

router.delete(
  "/:id",
  authTenant([Role.OWNER, Role.MANAGER]),
  menuController.deleteMenuItem,
);

export const menuRoutes = router;
