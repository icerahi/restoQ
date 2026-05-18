import bcrypt from "bcryptjs";
import status from "http-status";
import jwt, { SignOptions } from "jsonwebtoken";
import prisma from "../../config/db";
import { env } from "../../config/env";
import ApiError from "../../errors/ApiError";

export class AuthService {
  async loginSystem(email: string, password: string) {
    const user = await prisma.systemUser.findUnique({ where: { email } });

    if (!user) throw new ApiError(status.UNAUTHORIZED, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new ApiError(status.UNAUTHORIZED, "Invalid credentials");

    const payload = {
      userId: user.id,
      role: user.role,
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
      },
    };
  }

  async loginUser(email: string, password: string) {
    const user = await prisma.user.findUnique({
      where: { email },
      include: { restaurant: true },
    });

    if (!user) throw new ApiError(status.UNAUTHORIZED, "Invalid credentials");

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch)
      throw new ApiError(status.UNAUTHORIZED, "Invalid credentials");

    const payload = {
      userId: user.id,
      restaurantId: user.restaurantId,
      role: user.role,
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
        },
      },
    };
  }

  async getSystemMe(userId: string) {
    const user = await prisma.systemUser.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    });
    return user;
  }

  async getUserMe(userId: string) {
    const user = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        restaurant: {
          select: {
            id: true,
            name: true,
            subscriptionStatus: true,
          },
        },
      },
    });

    return user;
  }
}
