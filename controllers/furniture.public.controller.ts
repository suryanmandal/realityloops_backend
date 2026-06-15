import { Request, Response } from "express";
import { FurniturePublicService } from "../services/furniture.public.service";
import { logger } from "../utils/logger";

export class FurniturePublicController {
  /**
   * @route   GET /api/v1/public/furniture/products
   * @desc    Get all furniture products by store ID with filters
   * @access  Public
   */
  static async getProducts(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        storeId: req.query.storeId as string,
        categoryId: req.query.categoryId as string,
        isAvailable: req.query.isAvailable === "true" ? true : req.query.isAvailable === "false" ? false : undefined,
        minPrice: req.query.minPrice ? parseFloat(req.query.minPrice as string) : undefined,
        maxPrice: req.query.maxPrice ? parseFloat(req.query.maxPrice as string) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string || "createdAt",
        sortOrder: req.query.sortOrder === "asc" ? 1 : req.query.sortOrder === "desc" ? -1 : -1,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const domain = process.env.SELF_DOMAIN || `${req.protocol}://${req.get("host")}`;

      const result = await FurniturePublicService.getProducts(domain, filters);

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Get furniture products controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/public/furniture/stores
   * @desc    Get all furniture stores
   * @access  Public
   */
  static async getStores(req: Request, res: Response): Promise<Response> {
    try {
      const filters = {
        search: req.query.search as string,
        status: req.query.status as string,
        page: req.query.page ? parseInt(req.query.page as string) : 1,
        limit: req.query.limit ? parseInt(req.query.limit as string) : 20,
      };

      const result = await FurniturePublicService.getStores(filters);

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Get furniture stores controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
export default FurniturePublicController;
