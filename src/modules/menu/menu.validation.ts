import { z } from "zod";

export const createMenuSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    description: z.string().optional(),
    price: z.number().min(0, "Price must be positive"),
    image: z.string().optional(),
    isAvailable: z.boolean().optional(),
    categoryId: z.string().min(1, "categoryId is required"),
  }),
});

export const updateMenuSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    price: z.number().min(0).optional(),
    image: z.string().optional(),
    isAvailable: z.boolean().optional(),
    categoryId: z.string().optional(),
  }),
});
