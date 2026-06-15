import { FurnitureProduct, FurnitureStore, FurnitureCategory } from "../models";
import { logger } from "../utils/logger";
import { ProductStatus } from "../types/enums";
import { Types } from "mongoose";

export class FurniturePublicService {
  /**
   * Add domain to image and AR model paths
   */
  private static addDomainToPaths(product: any, domain: string) {
    if (product.image) {
      if (!product.image.startsWith('http')) {
        product.image = `${domain}/${product.image}`;
      }
    }

    if (product.arModelPath) {
      if (!product.arModelPath.startsWith('http')) {
        product.arModelPath = `${domain}/${product.arModelPath}`;
      }
    }

    return product;
  }

  /**
   * Get all products by store ID with filters
   */
  static async getProducts(
    domain: string,
    filters?: {
      storeId?: string;
      categoryId?: string;
      isAvailable?: boolean;
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
      if (filters?.storeId) {
        if (!Types.ObjectId.isValid(filters.storeId)) {
          return {
            success: false,
            message: "Invalid store ID",
          };
        }
        query.storeId = filters.storeId;
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

      let sortField = filters?.sortBy || "createdAt";
      const sortOrder = filters?.sortOrder || -1;

      const sortOptions: any = {};
      switch (sortField) {
        case "price":
          sortOptions.price = sortOrder;
          break;
        case "name":
        case "title":
          sortOptions.title = sortOrder;
          break;
        default:
          sortOptions[sortField] = sortOrder;
          break;
      }

      // Execute query with pagination and populate
      const [products, total] = await Promise.all([
        FurnitureProduct.find(query)
          .populate("categoryId", "name description image")
          .populate("storeId", "storeName ownerName")
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .lean(),
        FurnitureProduct.countDocuments(query),
      ]);

      const processedProducts = products.map(product => {
        const processedProduct = { ...product };
        return this.addDomainToPaths(processedProduct, domain);
      });

      return {
        success: true,
        message: "Furniture products retrieved successfully",
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
      logger.error("Error getting furniture products", {
        error: error.message,
        filters,
      });
      return {
        success: false,
        message: "Failed to retrieve furniture products",
      };
    }
  }

  /**
   * Get all stores
   */
  static async getStores(
    filters?: {
      search?: string;
      status?: string;
      page?: number;
      limit?: number;
    }
  ) {
    try {
      const query: any = { status: { $ne: "DELETED" } };

      if (filters?.search) {
        query.$or = [
          { storeName: { $regex: filters.search, $options: "i" } },
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

      const [stores, total] = await Promise.all([
        FurnitureStore.find(query)
          .select("-password -otp -otpExpiresAt")
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(limit),
        FurnitureStore.countDocuments(query),
      ]);

      return {
        success: true,
        message: "Furniture stores retrieved successfully",
        data: {
          stores,
          pagination: {
            page,
            limit,
            total,
            totalPages: Math.ceil(total / limit),
          },
        },
      };
    } catch (error: any) {
      logger.error("Error getting furniture stores", {
        error: error.message,
        filters,
      });
      return {
        success: false,
        message: "Failed to retrieve furniture stores",
      };
    }
  }
}
export default FurniturePublicService;
