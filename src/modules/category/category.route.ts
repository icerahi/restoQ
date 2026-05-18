import { Role } from "@prisma/client";
import { Router } from "express";
import { authTenant } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { CategoryController } from "./category.controller";
import {
  createCategorySchema,
  updateCategorySchema,
} from "./category.validation";

const router = Router();
const categoryController = new CategoryController();

router.post(
  "/",
  authTenant([Role.OWNER, Role.MANAGER]),
  validateRequest(createCategorySchema),
  categoryController.createCategory,
);

router.get("/", authTenant([]), categoryController.getAllCategories);

router.get("/:id", authTenant([]), categoryController.getCategoryById);

router.patch(
  "/:id",
  authTenant([Role.OWNER, Role.MANAGER]),
  validateRequest(updateCategorySchema),
  categoryController.updateCategory,
);

router.delete(
  "/:id",
  authTenant([Role.OWNER, Role.MANAGER]),
  categoryController.deleteCategory,
);

export const categoryRoutes = router;
