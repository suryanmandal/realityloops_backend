import { Router } from "express";
import { ProductController } from "../../controllers/product.controller";
import { validate } from "../../middleware/validation.middleware";
import { authenticate, isRestaurant } from "../../middleware/auth.middleware";
import { uploadProductFiles, uploadProductImage, uploadARModel } from "../../middleware/upload.middleware";
import {
    createProductSchema,
    updateProductSchema,
    bulkUpdateAvailabilitySchema,
} from "../../validation/product.validation";

const productRouter = Router();

// All product routes require authentication and restaurant role
productRouter.use(authenticate, isRestaurant);

// Bulk update availability (before /:id to avoid route conflicts)
productRouter.patch(
    "/bulk-availability",
    validate(bulkUpdateAvailabilitySchema),
    ProductController.bulkUpdateAvailability,
);

// Create product with image and AR model upload
productRouter.post(
    "/",
    uploadProductFiles,
    validate(createProductSchema),
    ProductController.createProduct,
);

// Get all products
productRouter.get("/", ProductController.getProducts);

// Get product by ID
productRouter.get("/:id", ProductController.getProductById);

// Update product with optional image and AR model upload
productRouter.put(
    "/:id",
    uploadProductFiles,
    validate(updateProductSchema),
    ProductController.updateProduct,
);

// Generate 3D Model from snapshot (Standard / HF)
productRouter.post(
    "/generate-3d/:id",
    uploadProductImage,
    ProductController.generate3DFromImage,
);

// Generate 3D Model from snapshot (Premium / Tripo3D)
productRouter.post(
    "/generate-3d-premium/:id",
    uploadProductImage,
    ProductController.generate3DPremium,
);

// Generate 3D Model from snapshot (Premium Lite / custom GPU server)
productRouter.post(
    "/generate-3d-standard/:id",
    uploadProductImage,
    ProductController.generate3DStandard,
);

// Upload 3D model directly (.glb)
productRouter.post(
    "/upload-3d/:id",
    uploadARModel,
    ProductController.upload3DModel,
);

// Delete product
productRouter.delete("/:id", ProductController.deleteProduct);

export default productRouter;
