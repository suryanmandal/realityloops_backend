import { Restaurant, Product } from "../models";
import { logger } from "../utils/logger";
import { Types } from "mongoose";

/**
 * Restaurant Admin Service Class
 */
export class RestaurantAdminService {
  /**
   * Add domain to image and AR model paths
   */
  private static addDomainToPaths(product: any, domain: string) {
    if (product.image) {
      // If image path is already a full URL, don't modify it
      if (!product.image.startsWith('http')) {
        product.image = `${domain}/${product.image}`;
      }
    }

    if (product.arModelPath) {
      // If AR model path is already a full URL, don't modify it
      if (!product.arModelPath.startsWith('http')) {
        product.arModelPath = `${domain}/${product.arModelPath}`;
      }
    }

    return product;
  }

  /**
   * Get all restaurants with pagination
   */
  static async getAllRestaurants(skip: number, limit: number): Promise<any> {
    try {
      const restaurants = await Restaurant.find({})
        .select("-password")
        .skip(skip)
        .limit(limit)
        .sort({ createdAt: -1 });

      const total = await Restaurant.countDocuments({});

      return {
        restaurants,
        pagination: {
          page: skip / limit + 1,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      logger.error("Error getting all restaurants", { error: error.message });
      throw new Error("Failed to get restaurants");
    }
  }

  /**
   * Get restaurant by ID
   */
  static async getRestaurantById(id: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(id)) {
        return {
          success: false,
          message: "Invalid restaurant ID",
        };
      }

      const restaurant = await Restaurant.findById(id).select("-password");

      if (!restaurant) {
        return {
          success: false,
          message: "Restaurant not found",
        };
      }

      return {
        success: true,
        message: "Restaurant retrieved successfully",
        data: {
          restaurant,
        },
      };
    } catch (error: any) {
      logger.error("Error getting restaurant by ID", {
        error: error.message,
        restaurantId: id,
      });
      return {
        success: false,
        message: "Failed to get restaurant",
      };
    }
  }

  /**
   * Get products by restaurant ID
   */
  static async getRestaurantProducts(restaurantId: string, domain?: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(restaurantId)) {
        return {
          success: false,
          message: "Invalid restaurant ID",
        };
      }

      // Check if restaurant exists
      const restaurant = await Restaurant.findById(restaurantId);
      if (!restaurant) {
        return {
          success: false,
          message: "Restaurant not found",
        };
      }

      const products = await Product.find({ restaurantId })
        .populate("categoryId", "name description")
        .sort({ createdAt: -1 });

      // Add domain to image and AR model paths if domain is provided
      if (domain) {
        const processedProducts = products.map(product => {
          const productObj = product.toObject();
          return this.addDomainToPaths(productObj, domain);
        });
        return {
          success: true,
          message: "Products retrieved successfully",
          data: {
            products: processedProducts,
          },
        };
      }

      return {
        success: true,
        message: "Products retrieved successfully",
        data: {
          products,
        },
      };
    } catch (error: any) {
      logger.error("Error getting restaurant products", {
        error: error.message,
        restaurantId,
      });
      return {
        success: false,
        message: "Failed to get products",
      };
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(productId: string, domain?: string): Promise<any> {
    try {
      if (!Types.ObjectId.isValid(productId)) {
        return {
          success: false,
          message: "Invalid product ID",
        };
      }

      const product = await Product.findById(productId)
        .populate("categoryId", "name description")
        .populate("restaurantId", "restaurantName ownerName email");

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      // Add domain to image and AR model paths if domain is provided
      if (domain) {
        const productObj = product.toObject();
        const processedProduct = this.addDomainToPaths(productObj, domain);
        return {
          success: true,
          message: "Product retrieved successfully",
          data: {
            product: processedProduct,
          },
        };
      }

      return {
        success: true,
        message: "Product retrieved successfully",
        data: {
          product,
        },
      };
    } catch (error: any) {
      logger.error("Error getting product by ID", {
        error: error.message,
        productId,
      });
      return {
        success: false,
        message: "Failed to get product",
      };
    }
  }
}
