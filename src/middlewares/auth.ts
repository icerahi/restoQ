import { SystemRole } from "@prisma/client";
import { NextFunction, Request, Response } from "express";
import status from "http-status";
import jwt, { JwtPayload } from "jsonwebtoken";
import { env } from "../config/env";
import ApiError from "../errors/ApiError";

const getUserId = (req: Request) => {
  const token = req.headers.authorization?.split(" ")[1];

  if (!token) {
    throw new ApiError(status.UNAUTHORIZED, "Authentication required");
  }

  try {
    const decoded = jwt.verify(token, env.jwt.secret) as any;
    return {
      userId: decoded.id,
      isSystemUser: decoded.isSystemUser,
      role: decoded.role,
    };
  } catch (error) {
    throw new ApiError(status.UNAUTHORIZED, "Invalid or expired token");
  }
};

export const authSystem = (roles: SystemRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const token = req.headers.authorization;
      if (!token)
        throw new ApiError(
          status.UNAUTHORIZED,
          "Authentication token required",
        );

      const verifiedToken = jwt.verify(token, env.jwt.secret) as JwtPayload;

      if (
        !verifiedToken.role ||
        (roles.length && !roles.includes(verifiedToken.role))
      ) {
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

// export const authAny = () => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { userId, isSystemUser, role } = getUserId(req);
//       req.user = {
//         userId,
//         globalRole: isSystemUser ? (role as SystemRole) : undefined,
//         role: !isSystemUser ? (role as Role) : undefined,
//       };
//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };

// export const authTenant = (roles: Role[]) => {
//   return async (req: Request, res: Response, next: NextFunction) => {
//     try {
//       const { userId, isSystemUser, role } = getUserId(req);

//       // Get the tenant slug or ID from the header
//       const tenantSlug = req.headers["x-tenant-id"] as string;

//       if (!tenantSlug) {
//         throw new ApiError(status.BAD_REQUEST, "Missing Header: x-tenant-id");
//       }

//       // Allow system users to bypass tenant restrictions
//       if (
//         isSystemUser &&
//         (role === SystemRole.SUPER_USER || role === SystemRole.SYSTEM_STAFF)
//       ) {
//         // Resolve the actual tenant ID from the slug
//         const restaurant = await prisma.restaurant.findUnique({
//           where: { slug: tenantSlug },
//         });

//         if (!restaurant) {
//           throw new ApiError(status.NOT_FOUND, "Tenant not found");
//         }

//         req.tenantId = restaurant.id;
//         req.user = { userId, globalRole: role as SystemRole };
//         return next();
//       }

//       // For standard restaurant users:
//       const user = await prisma.user.findUnique({
//         where: { id: userId },
//         include: { restaurant: true },
//       });

//       if (!user) {
//         throw new ApiError(status.NOT_FOUND, "User not found in database");
//       }

//       // Verify the user's restaurant matches the requested tenant slug
//       if (user.restaurant.slug !== tenantSlug) {
//         throw new ApiError(
//           status.UNAUTHORIZED,
//           "You are not part of this organization",
//         );
//       }

//       if (roles.length && !roles.includes(user.role)) {
//         throw new ApiError(
//           status.UNAUTHORIZED,
//           "You are not permitted to access this route",
//         );
//       }

//       req.tenantId = user.restaurantId;
//       req.user = { userId, role: user.role };
//       next();
//     } catch (err) {
//       next(err);
//     }
//   };
// };
