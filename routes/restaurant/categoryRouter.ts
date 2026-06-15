import { Router } from "express";
import { CategoryController } from "../../controllers/category.controller";
import { validate } from "../../middleware/validation.middleware";
import { authenticate, isRestaurant } from "../../middleware/auth.middleware";
import { uploadCategoryImage } from "../../middleware/upload.middleware";
import {
  createCategorySchema,
  updateCategorySchema,
} from "../../validation/product.validation";

const categoryRouter = Router();

// All category routes require authentication and restaurant role
categoryRouter.use(authenticate, isRestaurant);

// Create category with image upload
categoryRouter.post(
  "/",
  uploadCategoryImage,
  validate(createCategorySchema),
  CategoryController.createCategory,
);

// Get all categories
categoryRouter.get("/", CategoryController.getCategories);

// Get category by ID
categoryRouter.get("/:id", CategoryController.getCategoryById);

// Update category with optional image upload
categoryRouter.put(
  "/:id",
  uploadCategoryImage,
  validate(updateCategorySchema),
  CategoryController.updateCategory,
);

// Delete category
categoryRouter.delete("/:id", CategoryController.deleteCategory);

export default categoryRouter;
