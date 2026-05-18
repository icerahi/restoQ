import { SubscriptionStatus } from "@prisma/client";
import { z } from "zod";

export const createRestaurantSchema = z.object({
  restaurant: z.object({
    name: z.string({ message: "Restaurant name is required" }),
    phone: z.string().optional(),
    address: z.string().optional(),
  }),
  owner: z.object({
    name: z.string({ message: "Owner name is required" }),
    email: z.email({ message: "Owner email is required" }),
    password: z.string({ message: "Owner password is required" }).min(6),
  }),
});

export const updateMyRestaurantSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),
});



export const updateRestaurantSchema = z.object({
  name: z.string().optional(),
  phone: z.string().optional(),
  address: z.string().optional(),
  logo: z.string().optional(),

  subscriptionStatus: z.enum([...Object.values(SubscriptionStatus)]).optional(),
  isActive: z.boolean().optional(),
  subscriptionEnd: z.date().optional(),
});
