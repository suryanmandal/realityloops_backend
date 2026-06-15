import { Product, Restaurant, Category } from "../models";
import { logger } from "../utils/logger";
import { ProductStatus } from "../types/enums";
import { Types } from "mongoose";

export class PublicService {
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
   * Get all products by restaurant ID with filters
   */
  static async getProducts(
    domain: string,
    filters?: {
      restaurantId?: string;
      categoryId?: string;
      isAvailable?: boolean;
      isVegetarian?: boolean;
      minPrice?: number;
      maxPrice?: number;
      search?: string;
      sortBy?: string;
      sortOrder?: number;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const query: any = { status: ProductStatus.ACTIVE };

      // Apply filters
      if (filters?.restaurantId) {
        if (!Types.ObjectId.isValid(filters.restaurantId)) {
          return {
            success: false,
            message: "Invalid restaurant ID",
          };
        }
        query.restaurantId = filters.restaurantId;
      }

      if (filters?.categoryId) {
        if (!Types.ObjectId.isValid(filters.categoryId)) {
          return {
            success: false,
            message: "Invalid category ID",
          };
        }
        query.categoryId = filters.categoryId;
      }

      if (filters?.isAvailable !== undefined) {
        query.isAvailable = filters.isAvailable;
      }

      if (filters?.isVegetarian !== undefined) {
        query.isVegetarian = filters.isVegetarian;
      }

      if (filters?.minPrice || filters?.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
      }

      if (filters?.search) {
        query.$or = [
          { title: { $regex: filters.search, $options: "i" } },
          { description: { $regex: filters.search, $options: "i" } },
        ];
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      // Determine sort field and direction
      let sortField = filters?.sortBy || "createdAt";
      const sortOrder = filters?.sortOrder || -1;

      // Map sort options to actual fields
      const sortOptions: any = {};
      switch (sortField) {
        case "price":
          sortOptions.price = sortOrder;
          break;
        case "name":
        case "title":
          sortOptions.title = sortOrder;
          break;
        case "rating":
          sortOptions.rating = sortOrder;
          break;
        case "preparationTime":
          sortOptions.preparationTime = sortOrder;
          break;
        default:
          sortOptions[sortField] = sortOrder;
          break;
      }

      // Execute query with pagination and populate
      const [products, total] = await Promise.all([
        Product.find(query)
          .populate("categoryId", "name description image")
          .populate("restaurantId", "restaurantName ownerName")
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        Product.countDocuments(query),
      ]);

      // Add domain to product images
      const processedProducts = products.map(product => {
        const processedProduct = { ...product };
        return this.addDomainToPaths(processedProduct, domain);
      });

      return {
        success: true,
        message: "Products retrieved successfully",
        data: {
          products: processedProducts,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error: any) {
      logger.error("Error getting products", {
        error: error.message,
        filters,
      });
      return {
        success: false,
        message: "Failed to retrieve products",
      };
    }
  }

  /**
   * Get all restaurants
   */
  static async getRestaurants(
    filters?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const query: any = { status: { $ne: "DELETED" } }; // Exclude deleted restaurants

      // Apply filters
      if (filters?.search) {
        query.$or = [
          { restaurantName: { $regex: filters.search, $options: "i" } },
          { ownerName: { $regex: filters.search, $options: "i" } },
          { email: { $regex: filters.search, $options: "i" } },
        ];
      }

      if (filters?.status) {
        query.status = filters.status;
      }

      const page = filters?.page || 1;
      const limit = filters?.limit || 20;
      const skip = (page - 1) * limit;

      const [restaurants, total] = await Promise.all([
        Restaurant.find(query)
          .select("-password -otp -otpExpiresAt") // Exclude sensitive fields
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        Restaurant.countDocuments(query),
      ]);

      return {
        success: true,
        message: "Restaurants retrieved successfully",
        data: {
          restaurants,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error: any) {
      logger.error("Error getting restaurants", {
        error: error.message,
        filters,
      });
      return {
        success: false,
        message: "Failed to retrieve restaurants",
      };
    }
  }
}
