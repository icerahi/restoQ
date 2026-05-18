import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { restaurantRoutes } from '../modules/restaurant/restaurant.route';
import { userRoutes } from '../modules/user/user.route';

import { categoryRoutes } from '../modules/category/category.route';
import { menuRoutes } from '../modules/menu/menu.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/restaurants', route: restaurantRoutes },
  { path: '/users', route: userRoutes },
  { path: '/category', route: categoryRoutes },
  { path: '/menu', route: menuRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
