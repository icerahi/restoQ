import { Role, SystemRole } from "@prisma/client";
import { Router } from "express";
import { auth, authSystem } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import { createStaffSchema, updateUserSchema } from "./user.validation";

const router = Router();
const userController = new UserController();

// --- PLATFORM ADMIN ROUTES ---
// View all users across the whole system
router.get(
  "/all",
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]),
  userController.getUsers,
);

// --- RESTAURANT STAFF MANAGEMENT ---
// Create new staff member for a restaurant
router.post(
  "/staff",
  auth([Role.OWNER, Role.MANAGER]),
  validateRequest(createStaffSchema),
  userController.createStaff,
);

// List staff for current restaurant (God Mode supported)
router.get(
  "/",
  auth([Role.OWNER, Role.MANAGER]),
  userController.getUsers,
);

// Get, Update, Delete specific staff member
router.get(
  "/:id",
  auth([Role.OWNER, Role.MANAGER]),
  userController.getUserDetails,
);

router.patch(
  "/:id",
  auth([Role.OWNER, Role.MANAGER]),
  validateRequest(updateUserSchema),
  userController.updateUser,
);

router.delete(
  "/:id",
  auth([Role.OWNER, Role.MANAGER]),
  userController.deleteUser,
);

export const userRoutes = router;
