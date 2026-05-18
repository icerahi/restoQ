import { Role, SystemRole } from "@prisma/client";
import { Router } from "express";
import { authSystem, authTenant } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { UserController } from "./user.controller";
import {
  createSystemUserSchema,
  createUserSchema,
  updateSystemUserSchema,
  updateUserSchema,
} from "./user.validation";

const router = Router();
const userController = new UserController();

// --- SYSTEM USER ROUTES ---
router.post(
  "/system",
  authSystem([SystemRole.SUPER_USER]),
  validateRequest(createSystemUserSchema),
  userController.createSystemUser,
);

router.get(
  "/system",
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]),
  userController.getSystemUsers,
);

router.get(
  "/system/:id",
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]),
  userController.getSystemUserDetails,
);

router.patch(
  "/system/:id",
  authSystem([SystemRole.SUPER_USER]),
  validateRequest(updateSystemUserSchema),
  userController.updateSystemUser,
);

router.delete(
  "/system/:id",
  authSystem([SystemRole.SUPER_USER]),
  userController.deleteSystemUser,
);

// Get all tenant users
router.get(
  "/tenant",
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]),
  userController.getTenantUsers,
);

// --- RESTAURANT STAFF MANAGEMENT ---

// Get all stuff of own restaurant
router.get(
  "/me",
  authTenant([Role.OWNER, Role.MANAGER]),
  userController.getUsersMe,
);

// Get specific staff member of my own restaurant
router.get(
  "/me/:id",
  authTenant([Role.OWNER, Role.MANAGER]),
  userController.getUserDetails,
);

// Update specific staff member of my own restaurant
router.patch(
  "/me/:id",
  authTenant([Role.OWNER, Role.MANAGER]),
  validateRequest(updateUserSchema),
  userController.updateUser,
);

//  Delete specific staff member (Owner only)
router.delete("/me/:id", authTenant([Role.OWNER]), userController.deleteUser);

// Create new staff member for own restaurant
router.post(
  "/me",
  authTenant([Role.OWNER, Role.MANAGER]),
  validateRequest(createUserSchema),
  userController.createUsers,
);

export const userRoutes = router;
