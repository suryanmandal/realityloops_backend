import { Request, Response, NextFunction } from "express";
import { JWTService } from "../services/jwt.service";
import { logger } from "../utils/logger";
import { IJWTPayload } from "../types/interfaces";
import { UserRole, StaffRole } from "../types/enums";

// Extend Express Request to include user property
declare global {
  namespace Express {
    interface Request {
      user?: IJWTPayload;
    }
  }
}

/**
 * Authentication Middleware
 * Verifies JWT token and attaches user to request
 */
export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Get token from header
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      logger.warn("Authentication attempt without token", {
        path: req.path,
        ip: req.ip,
      });
      return res.status(401).json({
        success: false,
        message: "No token provided. Please login.",
      });
    }

    const token = authHeader.substring(7); // Remove 'Bearer ' prefix

    // Verify token
    const decoded = JWTService.verifyToken(token);

    // Attach user to request
    req.user = decoded;

    next();
  } catch (error: any) {
    logger.error("Authentication error", {
      error: error.message,
      path: req.path,
    });

    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please login again.",
    });
  }
};

/**
 * Authorization Middleware Factory
 * Checks if user has required role(s)
 */
export const authorize = (...allowedRoles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      logger.error("Authorization check without authenticated user", {
        path: req.path,
      });
      return res.status(401).json({
        success: false,
        message: "Unauthorized. Please login.",
      });
    }

    const hasRole = allowedRoles.includes(req.user.role);

    if (!hasRole) {
      logger.warn("Authorization failed - insufficient permissions", {
        userId: req.user.id,
        userRole: req.user.role,
        requiredRoles: allowedRoles,
        path: req.path,
      });

      return res.status(403).json({
        success: false,
        message: "Forbidden. You do not have permission to access this resource.",
      });
    }

    next();
  };
};

/**
 * Middleware to check if user is restaurant owner
 */
export const isRestaurant = authorize(UserRole.RESTAURANT);

/**
 * Middleware to check if user is admin
 */
export const isAdmin = authorize(UserRole.ADMIN);

/**
 * Middleware to check if user is staff
 */
export const isStaff = authorize(UserRole.STAFF);

/**
 * Middleware to check if user is restaurant or staff (works for same restaurant)
 */
export const isRestaurantOrStaff = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please login.",
    });
  }

  const isAllowed =
    req.user.role === UserRole.RESTAURANT || req.user.role === UserRole.STAFF || !req.user.role;

  if (!isAllowed) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Access restricted to restaurant and staff members.",
    });
  }

  next();
};

/**
 * Middleware to check if user is kitchen staff
 */
export const isKitchenStaff = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please login.",
    });
  }

  if (req.user.role !== UserRole.STAFF) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Access restricted to staff members only.",
    });
  }

  if (req.user.staffRole !== StaffRole.KITCHEN) {
    logger.warn("Access denied - not kitchen staff", {
      userId: req.user.id,
      staffRole: req.user.staffRole,
      path: req.path,
    });

    return res.status(403).json({
      success: false,
      message: "Forbidden. Access restricted to kitchen staff only.",
    });
  }

  next();
};

/**
 * Middleware to check if user is waiter/desk staff
 */
export const isWaiterStaff = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (!req.user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized. Please login.",
    });
  }

  if (req.user.role !== UserRole.STAFF) {
    return res.status(403).json({
      success: false,
      message: "Forbidden. Access restricted to staff members only.",
    });
  }

  if (req.user.staffRole !== StaffRole.WAITER_DESK) {
    logger.warn("Access denied - not waiter staff", {
      userId: req.user.id,
      staffRole: req.user.staffRole,
      path: req.path,
    });

    return res.status(403).json({
      success: false,
      message: "Forbidden. Access restricted to waiter/desk staff only.",
    });
  }

  next();
};

