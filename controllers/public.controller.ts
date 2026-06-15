import { Request, Response } from "express";
import { PublicService } from "../services/public.service";
import { logger } from "../utils/logger";

/**
 * Public API Controller Class
 */
export class PublicController {
  /**
   * @route   GET /api/v1/public/products
   * @desc    Get all products by restaurant ID with filters
   * @access  Public
   */
  static async getProducts(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        restaurantId: req.query.restaurantId as string,
        categoryId: req.query.categoryId as string,
        isAvailable: req.query.isAvailable === "true" ? true : req.query.isAvailable === "false" ? false : undefined,
        isVegetarian: req.query.isVegetarian === "true" ? true : req.query.isVegetarian === "false" ? false : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string || "createdAt",
        sortOrder: req.query.sortOrder === "asc" ? 1 : req.query.sortOrder === "desc" ? -1 : -1,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      // Get domain from environment variable
      const domain = process.env.SELF_DOMAIN || `${req.protocol}://${req.get("host")}`;

      const result = await PublicService.getProducts(domain, filters);

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Get products controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/public/restaurants
   * @desc    Get all restaurants
   * @access  Public
   */
  static async getRestaurants(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await PublicService.getRestaurants(filters);

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Get restaurants controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
