import { Router } from 'express';
import { restaurantController } from './restaurant.controller';
import { authSystem } from '../../middlewares/auth';
import { validateRequest } from '../../middlewares/validateRequest';
import { createRestaurantSchema, updateRestaurantStatusSchema } from './restaurant.validation';
import { SystemRole } from '@prisma/client';

const router = Router();

// All routes here are for Platform Admins (SystemUsers)
router.post(
  '/', 
  authSystem([SystemRole.SUPER_USER]), 
  validateRequest(createRestaurantSchema), 
  restaurantController.createRestaurant
);

router.get(
  '/', 
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]), 
  restaurantController.listRestaurants
);

router.get(
  '/:id', 
  authSystem([SystemRole.SUPER_USER, SystemRole.SYSTEM_STAFF]), 
  restaurantController.getRestaurant
);

router.patch(
  '/:id', 
  authSystem([SystemRole.SUPER_USER]), 
  validateRequest(updateRestaurantStatusSchema),
  restaurantController.updateRestaurant
);

export const restaurantRoutes = router;
