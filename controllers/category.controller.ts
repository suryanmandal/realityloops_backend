import { Request, Response } from "express";
import { CategoryService } from "../services/category.service";
import { logger } from "../utils/logger";
import { deleteFile } from "../middleware/upload.middleware";

export class CategoryController {
  /**
   * @route   POST /api/v1/restaurant/category
   * @desc    Create new category
   * @access  Private (Restaurant)
   */
  static async createCategory(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Get domain from environment variable
      const domain = process.env.SELF_DOMAIN || `${req.protocol}://${req.get("host")}`;

      const imagePath = req.file?.path;

      const result = await CategoryService.createCategory(restaurantId, {
        ...req.body,
        image: imagePath,
      }, domain);

      // If creation failed and image was uploaded, delete it
      if (!result.success && imagePath) {
        deleteFile(imagePath);
      }

      const statusCode = result.success ? 201 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Category create controller error", {
        error: error.message,
      });

      // Clean up uploaded file on error
      if (req.file?.path) {
        deleteFile(req.file.path);
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/restaurant/category
   * @desc    Get all categories
   * @access  Private (Restaurant)
   */
  static async getCategories(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Get domain from environment variable
      const domain = process.env.SELF_DOMAIN || `${req.protocol}://${req.get("host")}`;

      const filters = {
        status: req.query.status as any,
        search: req.query.search as string,
      };

      const result = await CategoryService.getCategories(restaurantId, domain, filters);

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Category get all controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/restaurant/category/:id
   * @desc    Get category by ID
   * @access  Private (Restaurant)
   */
  static async getCategoryById(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Get domain from environment variable
      const domain = process.env.SELF_DOMAIN || `${req.protocol}://${req.get("host")}`;

      const result = await CategoryService.getCategoryById(restaurantId, id, domain);

      const statusCode = result.success ? 200 : 404;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Category get by id controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   PUT /api/v1/restaurant/category/:id
   * @desc    Update category
   * @access  Private (Restaurant)
   */
  static async updateCategory(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      // Get domain from environment variable
      const domain = process.env.SELF_DOMAIN || `${req.protocol}://${req.get("host")}`;

      const imagePath = req.file?.path;

      const result = await CategoryService.updateCategory(restaurantId, id, {
        ...req.body,
        ...(imagePath && { image: imagePath }),
      }, domain);

      // If update failed and new image was uploaded, delete it
      if (!result.success && imagePath) {
        deleteFile(imagePath);
      }

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Category update controller error", {
        error: error.message,
      });

      // Clean up uploaded file on error
      if (req.file?.path) {
        deleteFile(req.file.path);
      }

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   DELETE /api/v1/restaurant/category/:id
   * @desc    Delete category
   * @access  Private (Restaurant)
   */
  static async deleteCategory(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await CategoryService.deleteCategory(restaurantId, id);

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Category delete controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
