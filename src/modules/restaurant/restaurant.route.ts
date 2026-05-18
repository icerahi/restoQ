import { Role, SystemRole } from "@prisma/client";
import { Router } from "express";
import { authSystem, authTenant } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { RestaurantController } from "./restaurant.controller";
import {
  createRestaurantSchema,
  updateRestaurantSchema,
} from "./restaurant.validation";

const router = Router();
const restaurantController = new RestaurantController();

// Access by all stuff member
router.get(
  "/me",
  authTenant([...Object.values(Role)]),
  restaurantController.getMyRestaurant,
);

router.patch(
  "/me",
  authTenant([Role.OWNER, Role.MANAGER]),
  restaurantController.updateMyRestaurant,
);

// All routes here are for Platform Admins (SystemUsers)
router.post(
  "/",
  authSystem([SystemRole.SUPER_USER]),
  validateRequest(createRestaurantSchema),
  restaurantController.createRestaurant,
);

router.get(
  "/",
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]),
  restaurantController.listRestaurants,
);

router.get(
  "/:id",
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]),
  restaurantController.getRestaurant,
);

router.patch(
  "/:id",
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]),
  validateRequest(updateRestaurantSchema),
  restaurantController.updateRestaurant,
);

router.delete(
  "/:id",
  authSystem([SystemRole.SUPER_USER]),
  restaurantController.deleteRestaurant,
);

export const restaurantRoutes = router;
