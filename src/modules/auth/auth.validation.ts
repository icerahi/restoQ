import { z } from "zod";

export const loginSchema = z.object({
  email: z.email(),
  password: z.string(),
  restaurantSlug: z.string().optional(), // For public menu / unified login resolution
});
