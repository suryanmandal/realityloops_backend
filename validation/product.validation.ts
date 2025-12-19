import { z } from "zod";
import { ProductStatus, CategoryStatus } from "../types/enums";

const CategoryStatusEnum = z.enum(
  Object.values(CategoryStatus) as [string, ...string[]],
);

const ProductStatusEnum = z.enum(
  Object.values(ProductStatus) as [string, ...string[]],
);

export const createCategorySchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Category name must be at least 2 characters")
      .max(100, "Category name cannot exceed 100 characters"),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters")
      .optional()
      .or(z.literal("")),
  }),
});

export const updateCategorySchema = z.object({
  body: z.object({
    name: z.string().min(2).max(100).optional(),
    description: z.string().max(500).optional().or(z.literal("")),
  }),
});

export const createProductSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, "Product title must be at least 3 characters")
      .max(200, "Product title cannot exceed 200 characters"),

    description: z
      .string()
      .trim()
      .min(10, "Product description must be at least 10 characters")
      .max(1000, "Product description cannot exceed 1000 characters"),

    mrp: z.coerce.number().min(0, "MRP cannot be negative"),

    price: z.coerce.number().min(0, "Price cannot be negative"),

    categoryId: z.string().min(1, "Category ID is required"),

    stock: z.coerce.number().min(0, "Stock cannot be negative").optional(),

    isVegetarian: z.coerce.boolean().optional(),

    preparationTime: z.coerce
      .number()
      .min(0, "Preparation time cannot be negative")
      .optional(),
  }),
});

export const updateProductSchema = z.object({
  body: z.object({
    title: z
      .string()
      .trim()
      .min(3, "Product title must be at least 3 characters")
      .max(200, "Product title cannot exceed 200 characters")
      .optional(),

    description: z
      .string()
      .trim()
      .min(10, "Product description must be at least 10 characters")
      .max(1000, "Product description cannot exceed 1000 characters")
      .optional(),

    mrp: z.coerce.number().min(0, "MRP cannot be negative").optional(),

    price: z.coerce.number().min(0, "Price cannot be negative").optional(),

    categoryId: z.string().optional(),

    status: ProductStatusEnum.optional(),

    stock: z.coerce.number().min(0, "Stock cannot be negative").optional(),

    isVegetarian: z.coerce.boolean().optional(),

    isAvailable: z.coerce.boolean().optional(),

    preparationTime: z.coerce
      .number()
      .min(0, "Preparation time cannot be negative")
      .optional(),
  }),
});

export const bulkUpdateAvailabilitySchema = z.object({
  productIds: z.array(z.string()).min(1, "At least one product ID is required"),

  isAvailable: z.boolean(),
});
