import Category from "../models/category";
import { logger } from "../utils/logger";
import { CategoryStatus } from "../types/enums";
import { deleteFile } from "../middleware/upload.middleware";

export class CategoryService {
  /**
   * Create a new category
   */
  static async createCategory(
    restaurantId: string,
    data: {
      name: string;
      description?: string;
      image?: string;
    },
    domain?: string,
  ) {
    try {
      // Check if category with same name exists for this restaurant
      const existingCategory = await Category.findOne({
        restaurantId,
        name: { $regex: new RegExp(`^${data.name}$`, "i") },
      });

      if (existingCategory) {
        return {
          success: false,
          message: "A category with this name already exists",
        };
      }

      const category = await Category.create({
        ...data,
        restaurantId,
      });

      logger.info("Category created", {
        categoryId: category._id,
        restaurantId,
      });

      // Add domain to image path if domain is provided
      if (domain) {
        const categoryObj = category.toObject();
        const processedCategory = this.addDomainToCategoryImage(categoryObj, domain);
        return {
          success: true,
          message: "Category created successfully",
          data: { category: processedCategory },
        };
      }

      return {
        success: true,
        message: "Category created successfully",
        data: { category },
      };
    } catch (error: any) {
      logger.error("Error creating category", { error: error.message });
      return {
        success: false,
        message: "Failed to create category",
      };
    }
  }

  /**
   * Add domain to category image path
   */
  private static addDomainToCategoryImage(category: any, domain: string) {
    if (category.image) {
      // If image path is already a full URL, don't modify it
      if (!category.image.startsWith('http')) {
        category.image = `${domain}/${category.image}`;
      }
    }

    return category;
  }

  /**
   * Get all categories for a restaurant
   */
  static async getCategories(
    restaurantId: string,
    domain?: string,
    filters?: {
      status?: CategoryStatus;
      search?: string;
    },
  ) {
    try {
      const query: any = { restaurantId };

      if (filters?.status) {
        query.status = filters.status;
      }

      if (filters?.search) {
        query.name = { $regex: filters.search, $options: "i" };
      }

      const categories = await Category.find(query).sort({ createdAt: -1 });

      // Add domain to image paths if domain is provided
      if (domain) {
        const processedCategories = categories.map(category => {
          const categoryObj = category.toObject();
          return this.addDomainToCategoryImage(categoryObj, domain);
        });
        return {
          success: true,
          data: { categories: processedCategories, count: categories.length },
        };
      }

      return {
        success: true,
        data: { categories, count: categories.length },
      };
    } catch (error: any) {
      logger.error("Error getting categories", { error: error.message });
      return {
        success: false,
        message: "Failed to get categories",
      };
    }
  }

  /**
   * Get category by ID
   */
  static async getCategoryById(restaurantId: string, categoryId: string, domain?: string) {
    try {
      const category = await Category.findOne({
        _id: categoryId,
        restaurantId,
      });

      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Add domain to image path if domain is provided
      if (domain) {
        const categoryObj = category.toObject();
        const processedCategory = this.addDomainToCategoryImage(categoryObj, domain);
        return {
          success: true,
          data: { category: processedCategory },
        };
      }

      return {
        success: true,
        data: { category },
      };
    } catch (error: any) {
      logger.error("Error getting category", { error: error.message });
      return {
        success: false,
        message: "Failed to get category",
      };
    }
  }

  /**
   * Update category
   */
  static async updateCategory(
    restaurantId: string,
    categoryId: string,
    data: {
      name?: string;
      description?: string;
      image?: string;
      status?: CategoryStatus;
    },
    domain?: string,
  ) {
    try {
      const category = await Category.findOne({
        _id: categoryId,
        restaurantId,
      });

      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // If updating name, check for duplicates
      if (data.name && data.name !== category.name) {
        const existingCategory = await Category.findOne({
          restaurantId,
          name: { $regex: new RegExp(`^${data.name}$`, "i") },
          _id: { $ne: categoryId },
        });

        if (existingCategory) {
          return {
            success: false,
            message: "A category with this name already exists",
          };
        }
      }

      // If updating image, delete old image
      if (data.image && category.image) {
        deleteFile(category.image);
      }

      // Update category
      Object.assign(category, data);
      await category.save();

      logger.info("Category updated", { categoryId, restaurantId });

      // Add domain to image path if domain is provided
      if (domain) {
        const categoryObj = category.toObject();
        const processedCategory = this.addDomainToCategoryImage(categoryObj, domain);
        return {
          success: true,
          message: "Category updated successfully",
          data: { category: processedCategory },
        };
      }

      return {
        success: true,
        message: "Category updated successfully",
        data: { category },
      };
    } catch (error: any) {
      logger.error("Error updating category", { error: error.message });
      return {
        success: false,
        message: "Failed to update category",
      };
    }
  }

  /**
   * Delete category
   */
  static async deleteCategory(restaurantId: string, categoryId: string) {
    try {
      const category = await Category.findOne({
        _id: categoryId,
        restaurantId,
      });

      if (!category) {
        return {
          success: false,
          message: "Category not found",
        };
      }

      // Check if category has products
      const Product = require("../models/product").default;
      const productsCount = await Product.countDocuments({ categoryId });

      if (productsCount > 0) {
        return {
          success: false,
          message: `Cannot delete category. It has ${productsCount} product(s) associated with it.`,
        };
      }

      // Delete image if exists
      if (category.image) {
        deleteFile(category.image);
      }

      await Category.findByIdAndDelete(categoryId);

      logger.info("Category deleted", { categoryId, restaurantId });

      return {
        success: true,
        message: "Category deleted successfully",
      };
    } catch (error: any) {
      logger.error("Error deleting category", { error: error.message });
      return {
        success: false,
        message: "Failed to delete category",
      };
    }
  }
}
