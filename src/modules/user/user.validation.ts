import { Role } from "@prisma/client";
import { z } from "zod";

export const createStaffSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Name is required"),
    email: z.string().email("Invalid email format"),
    password: z.string().min(6, "Password must be at least 6 characters"),
    role: z.nativeEnum(Role),
  }),
});

export const updateUserSchema = z.object({
  body: z.object({
    name: z.string().optional(),
    email: z.string().email().optional(),
    password: z.string().min(6).optional(),
    role: z.enum([Role.OWNER, Role.MANAGER, Role.KITCHEN, Role.WAITER]).optional(),
  }),
});
