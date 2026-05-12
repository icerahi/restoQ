import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.route';
import { restaurantRoutes } from '../modules/restaurant/restaurant.route';

const router = Router();

const moduleRoutes = [
  { path: '/auth', route: authRoutes },
  { path: '/restaurants', route: restaurantRoutes },
];

moduleRoutes.forEach((route) => router.use(route.path, route.route));

export default router;
