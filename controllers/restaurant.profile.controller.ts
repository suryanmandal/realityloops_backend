import { Request, Response } from "express";
import { RestaurantAdminService } from "../services/restaurant.admin.service";
import { logger } from "../utils/logger";

/**
 * Restaurant Profile Controller Class
 */
export class RestaurantProfileController {
  /**
   * @route   GET /api/v1/restaurant/account
   * @desc    Get restaurant account details
   * @access  Private (Restaurant only)
   */
  static async getRestaurantAccount(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await RestaurantAdminService.getCurrentRestaurantAccount(restaurantId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Get restaurant account controller error", {
        error: error.message,
        restaurantId: req.user?.id,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   PUT /api/v1/restaurant/account
   * @desc    Update restaurant account details
   * @access  Private (Restaurant only)
   */
  static async updateRestaurantAccount(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;
      const updateData = req.body;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await RestaurantAdminService.updateCurrentRestaurantAccount(restaurantId, updateData);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Update restaurant account controller error", {
        error: error.message,
        restaurantId: req.user?.id,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   DELETE /api/v1/restaurant/account
   * @desc    Delete restaurant account
   * @access  Private (Restaurant only)
   */
  static async deleteRestaurantAccount(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await RestaurantAdminService.deleteCurrentRestaurantAccount(restaurantId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Delete restaurant account controller error", {
        error: error.message,
        restaurantId: req.user?.id,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/restaurant/dashboard
   * @desc    Get restaurant dashboard overview
   * @access  Private (Restaurant only)
   */
  static async getRestaurantDashboard(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await RestaurantAdminService.getCurrentRestaurantDashboard(restaurantId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Get restaurant dashboard controller error", {
        error: error.message,
        restaurantId: req.user?.id,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/restaurant/dashboard/analytics
   * @desc    Get restaurant analytics
   * @access  Private (Restaurant only)
   */
  static async getRestaurantAnalytics(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await RestaurantAdminService.getCurrentRestaurantAnalytics(restaurantId);

      if (!result.success) {
        return res.status(404).json(result);
      }

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Get restaurant analytics controller error", {
        error: error.message,
        restaurantId: req.user?.id,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
