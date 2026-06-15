import Product from "../models/product";
import Category from "../models/category";
import { logger } from "../utils/logger";
import { ProductStatus } from "../types/enums";
import { deleteFile } from "../middleware/upload.middleware";

export class ProductService {
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
   * Create a new product
   */
  static async createProduct(
    restaurantId: string,
    data: {
      title: string;
      description: string;
      mrp: number;
      price: number;
      categoryId: string;
      image?: string;
      arModelPath?: string;
      stock?: number;
      isVegetarian?: boolean;
      preparationTime?: number;
    },
    domain?: string
  ) {
    try {
      // Verify category exists and belongs to restaurant
      const category = await Category.findOne({
        _id: data.categoryId,
        restaurantId,
      });

      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Validate price
      if (data.price > data.mrp) {
        return {
          success: false,
          message: "Price cannot be greater than MRP",
        };
      }

      const product = await Product.create({
        ...data,
        restaurantId,
      });

      logger.info("Product created", {
        productId: product._id,
        restaurantId,
      });

      // Add domain to image and AR model paths if domain is provided
      if (domain) {
        const productObj = product.toObject();
        const processedProduct = this.addDomainToPaths(productObj, domain);
        return {
          success: true,
          message: "Product created successfully",
          data: { product: processedProduct },
        };
      }

      return {
        success: true,
        message: "Product created successfully",
        data: { product },
      };
    } catch (error: any) {
      logger.error("Error creating product", { error: error.message });
      return {
        success: false,
        message: "Failed to create product",
      };
    }
  }

  /**
   * Get all products for a restaurant
   */
  static async getProducts(
    restaurantId: string,
    filters?: {
      categoryId?: string;
      status?: ProductStatus;
      isVegetarian?: boolean;
      search?: string;
      minPrice?: number;
      maxPrice?: number;
    },
    domain?: string
  ) {
    try {
      const query: any = { restaurantId };

      if (filters?.categoryId) {
        query.categoryId = filters.categoryId;
      }

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.isVegetarian !== undefined) {
        query.isVegetarian = filters.isVegetarian;
      }

      if (filters?.search) {
        query.$text = { $search: filters.search };
      }

      if (filters?.minPrice || filters?.maxPrice) {
        query.price = {};
        if (filters.minPrice) query.price.$gte = filters.minPrice;
        if (filters.maxPrice) query.price.$lte = filters.maxPrice;
      }

      const products = await Product.find(query)
        .populate("categoryId", "name")
        .sort({ createdAt: -1 });

      // Add domain to image and AR model paths if domain is provided
      if (domain) {
        const processedProducts = products.map(product => {
          const productObj = product.toObject();
          return this.addDomainToPaths(productObj, domain);
        });
        return {
          success: true,
          data: { products: processedProducts, count: processedProducts.length },
        };
      }

      return {
        success: true,
        data: { products, count: products.length },
      };
    } catch (error: any) {
      logger.error("Error getting products", { error: error.message });
      return {
        success: false,
        message: "Failed to get products",
      };
    }
  }

  /**
   * Get product by ID
   */
  static async getProductById(restaurantId: string, productId: string, domain?: string) {
    try {
      const product = await Product.findOne({
        _id: productId,
        restaurantId,
      }).populate("categoryId", "name description");

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
          data: { product: processedProduct },
        };
      }

      return {
        success: true,
        data: { product },
      };
    } catch (error: any) {
      logger.error("Error getting product", { error: error.message });
      return {
        success: false,
        message: "Failed to get product",
      };
    }
  }

  /**
   * Update product
   */
  static async updateProduct(
    restaurantId: string,
    productId: string,
    data: {
      title?: string;
      description?: string;
      mrp?: number;
      price?: number;
      categoryId?: string;
      image?: string;
      arModelPath?: string;
      arModelUrl?: string;
      status?: ProductStatus;
      stock?: number;
      isVegetarian?: boolean;
      isAvailable?: boolean;
      preparationTime?: number;
    },
    domain?: string
  ) {
    try {
      const product = await Product.findOne({
        _id: productId,
        restaurantId,
      });

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      // If updating category, verify it exists
      if (
        data.categoryId &&
        data.categoryId !== product.categoryId.toString()
      ) {
        const category = await Category.findOne({
          _id: data.categoryId,
          restaurantId,
        });

        if (!category) {
          return {
            success: false,
            message: "Category not found",
          };
        }
      }

      // Validate price if both are being updated
      const newMrp = data.mrp ?? product.mrp;
      const newPrice = data.price ?? product.price;

      if (newPrice > newMrp) {
        return {
          success: false,
          message: "Price cannot be greater than MRP",
        };
      }

      // If updating image, delete old image
      if (data.image && product.image) {
        deleteFile(product.image);
      }

      // If updating AR model, delete old model
      if (data.arModelPath && product.arModelPath) {
        deleteFile(product.arModelPath);
      }

      // Update product
      Object.assign(product, data);
      await product.save();

      logger.info("Product updated", { productId, restaurantId });

      // Add domain to image and AR model paths if domain is provided
      if (domain) {
        const productObj = product.toObject();
        const processedProduct = this.addDomainToPaths(productObj, domain);
        return {
          success: true,
          message: "Product updated successfully",
          data: { product: processedProduct },
        };
      }

      return {
        success: true,
        message: "Product updated successfully",
        data: { product },
      };
    } catch (error: any) {
      logger.error("Error updating product", { error: error.message });
      return {
        success: false,
        message: "Failed to update product",
      };
    }
  }

  /**
   * Delete product
   */
  static async deleteProduct(restaurantId: string, productId: string) {
    try {
      const product = await Product.findOne({
        _id: productId,
        restaurantId,
      });

      if (!product) {
        return {
          success: false,
          message: "Product not found",
        };
      }

      // Delete image if exists
      if (product.image) {
        deleteFile(product.image);
      }

      // Delete AR model if exists
      if (product.arModelPath) {
        deleteFile(product.arModelPath);
      }

      await Product.findByIdAndDelete(productId);

      logger.info("Product deleted", { productId, restaurantId });

      return {
        success: true,
        message: "Product deleted successfully",
      };
    } catch (error: any) {
      logger.error("Error deleting product", { error: error.message });
      return {
        success: false,
        message: "Failed to delete product",
      };
    }
  }

  /**
   * Bulk update product availability
   */
  static async bulkUpdateAvailability(
    restaurantId: string,
    productIds: string[],
    isAvailable: boolean,
  ) {
    try {
      const result = await Product.updateMany(
        { _id: { $in: productIds }, restaurantId },
        { isAvailable },
      );

      logger.info("Bulk product availability updated", {
        count: result.modifiedCount,
        restaurantId,
      });

      return {
        success: true,
        message: `${result.modifiedCount} product(s) updated successfully`,
        data: { modifiedCount: result.modifiedCount },
      };
    } catch (error: any) {
      logger.error("Error bulk updating products", { error: error.message });
      return {
        success: false,
        message: "Failed to update products",
      };
    }
  }
}
