import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1, "Name is required"),
  sortOrder: z.number().optional(),
});

export const updateCategorySchema = z.object({
  name: z.string().optional(),
  sortOrder: z.number().optional(),
});
