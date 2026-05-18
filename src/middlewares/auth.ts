import { Role, SystemRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import prisma from "../config/db";
import { env } from "../config/env";
import ApiError from "../errors/ApiError";

const VerifyToken = (req: Request) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new ApiError(
      status.UNAUTHORIZED,
      "Authentication required (Bearer token)",
    );
  }

  const token = authHeader.split(" ")[1];

  return jwt.verify(token, env.jwt.secret) as JwtPayload;
};

export const authSystem = (roles: SystemRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const verifiedToken = VerifyToken(req);

      if (roles.length && !roles.includes(verifiedToken.role as SystemRole)) {
        throw new ApiError(
          status.FORBIDDEN,
          "You are not authorized to access this route",
        );
      }

      req.user = verifiedToken;
      next();
    } catch (err) {
      next(err);
    }
  };
};

export const authTenant = (roles: Role[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const verifiedToken = VerifyToken(req);
      const tenantId = req.headers["x-tenant-id"] as string;

      // 1. GOD MODE: System users can access any tenant
      if (
        Object.values(SystemRole).includes(verifiedToken.role as SystemRole)
      ) {
        if (!tenantId) {
          throw new ApiError(
            status.BAD_REQUEST,
            "x-tenant-id header is required for System User",
          );
        }

        const restaurant = await prisma.restaurant.findUnique({
          where: { id: tenantId },
        });

        if (!restaurant) {
          throw new ApiError(status.NOT_FOUND, "Target restaurant not found");
        }

        req.tenantId = restaurant.id;
        req.user = verifiedToken;
        return next();
      }

      // 2. STANDARD MODE: Restaurant users
      // We securely extract the restaurantId directly from the token payload.
      // We do NOT require the x-tenant-id header, and if they send one, we ignore it.
      if (roles.length && !roles.includes(verifiedToken.role)) {
        throw new ApiError(
          status.FORBIDDEN,
          "You are not authorized to access this route",
        );
      }

      req.tenantId = verifiedToken.restaurantId;
      req.user = verifiedToken;
      next();
    } catch (err) {
      next(err);
    }
  };
};
