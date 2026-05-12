import { z } from 'zod';

export const createRestaurantSchema = z.object({
  restaurantName: z.string({ message: 'Restaurant name is required' }),
  slug: z.string({ message: 'Slug is required' }),
  phone: z.string({ message: 'Phone number is required' }),
  address: z.string().optional(),
  ownerName: z.string({ message: 'Owner name is required' }),
  ownerEmail: z.string({ message: 'Owner email is required' }).email(),
  ownerPassword: z.string({ message: 'Owner password is required' }).min(6),
});

export const updateRestaurantStatusSchema = z.object({
  subscriptionStatus: z.enum(['trial', 'active', 'expired', 'suspended']).optional(),
  isActive: z.boolean().optional(),
  subscriptionEnd: z.string().datetime().optional(),
});
