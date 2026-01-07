import { Request, Response } from "express";
import { RestaurantAdminService } from "../services/restaurant.admin.service";
import { logger } from "../utils/logger";

/**
 * Restaurant Admin Controller Class
 */
export class RestaurantAdminController {
  /**
   * @route   GET /api/v1/admin/restaurant/all
   * @desc    Get all restaurants
   * @access  Private (Admin only)
   */
  static async getAllRestaurants(req: Request, res: Response): Promise<Response> {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const skip = (page - 1) * limit;

      const result = await RestaurantAdminService.getAllRestaurants(skip, limit);

      return res.status(200).json({
        success: true,
        message: "Restaurants retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      logger.error("Get all restaurants controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/admin/restaurant/:id
   * @desc    Get restaurant by ID
   * @access  Private (Admin only)
   */
  static async getRestaurantById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      const result = await RestaurantAdminService.getRestaurantById(id);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Get restaurant by ID controller error", {
        error: error.message,
        restaurantId: req.params.id,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/admin/restaurant/products/:id
   * @desc    Get products by restaurant ID
   * @access  Private (Admin only)
   */
  static async getRestaurantProducts(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Get domain from environment variable
      const domain = process.env.SELF_DOMAIN || `${req.protocol}://${req.get("host")}`;

      const result = await RestaurantAdminService.getRestaurantProducts(id, domain);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Get restaurant products controller error", {
        error: error.message,
        restaurantId: req.params.id,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/admin/restaurant/product/:id
   * @desc    Get product by ID
   * @access  Private (Admin only)
   */
  static async getProductById(req: Request, res: Response): Promise<Response> {
    try {
      const { id } = req.params;

      // Get domain from environment variable
      const domain = process.env.SELF_DOMAIN || `${req.protocol}://${req.get("host")}`;

      const result = await RestaurantAdminService.getProductById(id, domain);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Get product by ID controller error", {
        error: error.message,
        productId: req.params.id,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
