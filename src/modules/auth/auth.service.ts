import bcrypt from "bcryptjs";
import status from "http-status";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../../config/db";
import { env } from "../../config/env";
import ApiError from "../../errors/ApiError";

export class AuthService {
  async login(email: string, password: string) {
    // 1. Check SystemUser first
    const systemUser = await prisma.systemUser.findUnique({
      where: { email },
    });

    if (systemUser) {
      const isMatch = await bcrypt.compare(password, systemUser.password);
      if (!isMatch)
        throw new ApiError(status.UNAUTHORIZED, "Invalid credentials");

      const payload = {
        id: systemUser.id,
        role: systemUser.role,
        isSystemUser: true,
      };

      const token = jwt.sign(payload, env.jwt.secret, {
        expiresIn: env.jwt.expiresIn,
      } as SignOptions);

      return {
        token,
        user: {
          id: systemUser.id,
          name: systemUser.name,
          email: systemUser.email,
          role: systemUser.role,
        },
      };
    }

    // 2. Check Restaurant User
    const user = await prisma.user.findUnique({
      where: { email },
      include: { restaurant: true },
    });

    if (!user) {
      throw new ApiError(status.UNAUTHORIZED, "Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      throw new ApiError(status.UNAUTHORIZED, "Invalid credentials");
    }

    const payload = {
      id: user.id,
      restaurantId: user.restaurantId,
      role: user.role, // OWNER, MANAGER, etc.
      isSystemUser: false,
    };

    const token = jwt.sign(payload, env.jwt.secret, {
      expiresIn: env.jwt.expiresIn,
    } as SignOptions);

    return {
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        restaurant: {
          id: user.restaurant.id,
          name: user.restaurant.name,
          slug: user.restaurant.slug,
        },
      },
    };
  }

  async getMe(userId: string, isSystemUser: boolean) {
    if (isSystemUser) {
      const user = await prisma.systemUser.findUnique({
        where: { id: userId },
        select: { id: true, name: true, email: true, role: true, createdAt: true },
      });
      if (!user) throw new ApiError(status.NOT_FOUND, "User not found");
      return user;
    } else {
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, name: true, email: true, role: true, createdAt: true,
          restaurant: { select: { id: true, name: true, slug: true, subscriptionStatus: true } }
        },
      });
      if (!user) throw new ApiError(status.NOT_FOUND, "User not found");
      return user;
    }
  }
}
