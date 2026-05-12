import prisma from '../../config/db';
import bcrypt from 'bcryptjs';
import ApiError from '../../errors/ApiError';
import status from 'http-status';

export class RestaurantService {
  async createRestaurant(data: any, createdById: string) {
    const existingRestaurant = await prisma.restaurant.findUnique({
      where: { slug: data.slug }
    });
    
    if (existingRestaurant) {
      throw new ApiError(status.CONFLICT, 'Restaurant slug already exists');
    }

    const hashedPassword = await bcrypt.hash(data.ownerPassword, 10);

    const result = await prisma.$transaction(async (tx) => {
      const restaurant = await tx.restaurant.create({
        data: {
          name: data.restaurantName,
          slug: data.slug,
          phone: data.phone,
          address: data.address,
          createdById: createdById,
        }
      });

      const owner = await tx.user.create({
        data: {
          email: data.ownerEmail,
          password: hashedPassword,
          name: data.ownerName,
          role: 'OWNER',
          restaurantId: restaurant.id,
        }
      });

      return { restaurant, owner };
    });

    return result;
  }

  async listRestaurants() {
    return await prisma.restaurant.findMany({
      include: {
        _count: {
          select: { users: true, tables: true }
        }
      }
    });
  }

  async getRestaurantById(id: string) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        users: {
          select: { id: true, name: true, email: true, role: true }
        },
        _count: {
          select: { categories: true, menuItems: true, tables: true }
        }
      }
    });

    if (!restaurant) {
      throw new ApiError(status.NOT_FOUND, 'Restaurant not found');
    }

    return restaurant;
  }

  async updateRestaurantStatus(id: string, data: any) {
    const restaurant = await prisma.restaurant.findUnique({
      where: { id }
    });

    if (!restaurant) {
      throw new ApiError(status.NOT_FOUND, 'Restaurant not found');
    }

    return await prisma.restaurant.update({
      where: { id },
      data
    });
  }
}

export const restaurantService = new RestaurantService();
