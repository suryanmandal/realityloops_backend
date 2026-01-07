import { Request, Response } from "express";
import { ProductService } from "../services/product.service";
import { logger } from "../utils/logger";
import { deleteFile } from "../middleware/upload.middleware";

export class ProductController {
  /**
   * @route   POST /api/v1/restaurant/product
   * @desc    Create new product
   * @access  Private (Restaurant)
   */
  static async createProduct(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imagePath = files?.image?.[0]?.path;
      const arModelPath = files?.arModel?.[0]?.path;

      const result = await ProductService.createProduct(restaurantId, {
        ...req.body,
        mrp: parseFloat(req.body.mrp),
        price: parseFloat(req.body.price),
        stock: req.body.stock ? parseInt(req.body.stock) : undefined,
        preparationTime: req.body.preparationTime
          ? parseInt(req.body.preparationTime)
          : undefined,
        isVegetarian: req.body.isVegetarian === "true",
        image: imagePath,
        arModelPath: arModelPath || req.body.arModelPath, // Use uploaded file path or URL from body
      });

      // If creation failed, delete uploaded files
      if (!result.success) {
        if (imagePath) deleteFile(imagePath);
        if (arModelPath) deleteFile(arModelPath);
      }

      const statusCode = result.success ? 201 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Product create controller error", {
        error: error.message,
      });

      // Clean up uploaded files on error
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.image?.[0]?.path) deleteFile(files.image[0].path);
      if (files?.arModel?.[0]?.path) deleteFile(files.arModel[0].path);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/restaurant/product
   * @desc    Get all products
   * @access  Private (Restaurant)
   */
  static async getProducts(req: Request, res: Response): Promise<Response> {
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
        categoryId: req.query.categoryId as string,
        status: req.query.status as any,
        isVegetarian:
          req.query.isVegetarian === "true"
            ? true
            : req.query.isVegetarian === "false"
              ? false
              : undefined,
        search: req.query.search as string,
        minPrice: req.query.minPrice
          ? parseFloat(req.query.minPrice as string)
          : undefined,
        maxPrice: req.query.maxPrice
          ? parseFloat(req.query.maxPrice as string)
          : undefined,
      };

      const result = await ProductService.getProducts(restaurantId, filters, domain);

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Product get all controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   GET /api/v1/restaurant/product/:id
   * @desc    Get product by ID
   * @access  Private (Restaurant)
   */
  static async getProductById(req: Request, res: Response): Promise<Response> {
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

      const result = await ProductService.getProductById(restaurantId, id, domain);

      const statusCode = result.success ? 200 : 404;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Product get by id controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   PUT /api/v1/restaurant/product/:id
   * @desc    Update product
   * @access  Private (Restaurant)
   */
  static async updateProduct(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      const imagePath = files?.image?.[0]?.path;
      const arModelPath = files?.arModel?.[0]?.path;

      const updateData: any = { ...req.body };

      // Parse numeric fields
      if (req.body.mrp) updateData.mrp = parseFloat(req.body.mrp);
      if (req.body.price) updateData.price = parseFloat(req.body.price);
      if (req.body.stock) updateData.stock = parseInt(req.body.stock);
      if (req.body.preparationTime)
        updateData.preparationTime = parseInt(req.body.preparationTime);
      if (req.body.isVegetarian !== undefined)
        updateData.isVegetarian = req.body.isVegetarian === "true";
      if (req.body.isAvailable !== undefined)
        updateData.isAvailable = req.body.isAvailable === "true";

      // Add file paths
      if (imagePath) updateData.image = imagePath;
      if (arModelPath) updateData.arModelPath = arModelPath;

      const result = await ProductService.updateProduct(
        restaurantId,
        id,
        updateData,
      );

      // If update failed, delete newly uploaded files
      if (!result.success) {
        if (imagePath) deleteFile(imagePath);
        if (arModelPath) deleteFile(arModelPath);
      }

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Product update controller error", {
        error: error.message,
      });

      // Clean up uploaded files on error
      const files = req.files as { [fieldname: string]: Express.Multer.File[] };
      if (files?.image?.[0]?.path) deleteFile(files.image[0].path);
      if (files?.arModel?.[0]?.path) deleteFile(files.arModel[0].path);

      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   DELETE /api/v1/restaurant/product/:id
   * @desc    Delete product
   * @access  Private (Restaurant)
   */
  static async deleteProduct(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;
      const { id } = req.params;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await ProductService.deleteProduct(restaurantId, id);

      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Product delete controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   PATCH /api/v1/restaurant/product/bulk-availability
   * @desc    Bulk update product availability
   * @access  Private (Restaurant)
   */
  static async bulkUpdateAvailability(
    req: Request,
    res: Response,
  ): Promise<Response> {
    try {
      const restaurantId = req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { productIds, isAvailable } = req.body;

      if (!Array.isArray(productIds) || typeof isAvailable !== "boolean") {
        return res.status(400).json({
          success: false,
          message: "Invalid request data",
        });
      }

      const result = await ProductService.bulkUpdateAvailability(
        restaurantId,
        productIds,
        isAvailable,
      );

      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Product bulk update controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
