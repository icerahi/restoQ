import { TableStatus } from "@prisma/client";
import { z } from "zod";

export const createTableSchema = z.object({
  number: z.string().min(1, "Table number is required"),
  status: z.enum([...Object.values(TableStatus)]).optional(),
  layoutSettings: z.any().optional(),
});

export const updateTableSchema = z.object({
  number: z.string().min(1).optional(),
  status: z.enum([...Object.values(TableStatus)]).optional(),
  layoutSettings: z.any().optional(),
});
