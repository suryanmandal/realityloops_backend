import { Request, Response, NextFunction } from "express";
import { ZodSchema, ZodError } from "zod";
import { logger } from "../utils/logger";

/**
 * Validation Middleware
 */
export const validate = (schema: ZodSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      await schema.parseAsync({
        body: req.body,
        query: req.query,
        params: req.params,
      });
      next();
    } catch (error) {
      if (error instanceof ZodError) {
        const errors = error.issues.map((err) => ({
          field: err.path.join("."),
          message: err.message,
        }));

        logger.warn("Validation error", { errors, path: req.path });

        return res.status(400).json({
          success: false,
          message: "Validation failed",
          errors,
        });
      }

      logger.error("Unexpected validation error", { error });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  };
};
