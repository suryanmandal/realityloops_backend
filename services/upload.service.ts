import { logger } from "../utils/logger";
import { deleteFile } from "../middleware/upload.middleware";
import { Product } from "../models";
import { Types } from "mongoose";
import { uploadToR2 } from "../utils/r2.util";

/**
 * Upload Service Class
 * Handles file upload business logic
 */
export class UploadService {
    /**
     * Process 3D model upload and generate public URL
     */
    static async process3DModelUpload(
        file: Express.Multer.File | undefined,
        baseUrl: string
    ): Promise<{ success: boolean; message: string; data?: { arModelPath: string; filename: string } }> {
        try {
            if (!file) {
                return {
                    success: false,
                    message: "No file uploaded. Please provide a 3D model file.",
                };
            }

            // Validate file extension
            const allowedExtensions = ['.glb', '.gltf', '.usdz'];
            const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

            if (!allowedExtensions.includes(fileExtension)) {
                // Delete the uploaded file
                deleteFile(file.path);
                return {
                    success: false,
                    message: `Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`,
                };
            }

            // Generate public URL path
            let arModelPath = `${baseUrl}/uploads/3d-models/${file.filename}`;

            // Upload to Cloudflare R2 if configured
            const r2Url = await uploadToR2(
                file.path,
                `uploads/3d-models/${file.filename}`,
                "model/gltf-binary"
            );
            if (r2Url) {
                arModelPath = r2Url;
            }

            logger.info("3D model uploaded successfully", {
                filename: file.filename,
                size: file.size,
                arModelPath: arModelPath,
            });

            return {
                success: true,
                message: "3D model uploaded successfully",
                data: {
                    arModelPath: arModelPath,
                    filename: file.filename,
                },
            };
        } catch (error: any) {
            logger.error("Error processing 3D model upload", {
                error: error.message,
            });

            // Clean up file if error occurs
            if (file?.path) {
                deleteFile(file.path);
            }

            return {
                success: false,
                message: "Failed to process 3D model upload",
            };
        }
    }

    /**
     * Process 3D model upload and update product AR model path
     */
    static async process3DModelUploadAndUpdateProduct(
        file: Express.Multer.File | undefined,
        productId: string
    ): Promise<{ success: boolean; message: string; data?: { arModelPath: string; filename: string } }> {
        try {
            if (!file) {
                return {
                    success: false,
                    message: "No file uploaded. Please provide a 3D model file.",
                };
            }

            // Validate product ID
            if (!Types.ObjectId.isValid(productId)) {
                return {
                    success: false,
                    message: "Invalid product ID.",
                };
            }

            // Validate file extension
            const allowedExtensions = ['.glb', '.gltf', '.usdz'];
            const fileExtension = file.originalname.toLowerCase().slice(file.originalname.lastIndexOf('.'));

            if (!allowedExtensions.includes(fileExtension)) {
                // Delete the uploaded file
                deleteFile(file.path);
                return {
                    success: false,
                    message: `Invalid file type. Only ${allowedExtensions.join(', ')} files are allowed.`,
                };
            }

            // Check if product exists
            const product = await Product.findById(productId);
            if (!product) {
                // Delete the uploaded file
                deleteFile(file.path);
                return {
                    success: false,
                    message: "Product not found.",
                };
            }

            // Generate public URL path
            let arModelPath = `uploads/3d-models/${file.filename}`;

            // Upload to Cloudflare R2 if configured
            const r2Url = await uploadToR2(
                file.path,
                `uploads/3d-models/${file.filename}`,
                "model/gltf-binary"
            );
            if (r2Url) {
                arModelPath = r2Url;
            }

            // Update product with new AR model path
            await Product.findByIdAndUpdate(productId, { arModelPath });

            logger.info("3D model uploaded and product updated successfully", {
                filename: file.filename,
                size: file.size,
                arModelPath: arModelPath,
                productId: productId,
            });

            return {
                success: true,
                message: "3D model uploaded and product AR model path updated successfully",
                data: {
                    arModelPath: arModelPath,
                    filename: file.filename,
                },
            };
        } catch (error: any) {
            logger.error("Error processing 3D model upload and updating product", {
                error: error.message,
            });

            // Clean up file if error occurs
            if (file?.path) {
                deleteFile(file.path);
            }

            return {
                success: false,
                message: "Failed to process 3D model upload and update product",
            };
        }
    }

    /**
     * Delete 3D model file
     */
    static async delete3DModel(
        filename: string
    ): Promise<{ success: boolean; message: string }> {
        try {
            const filePath = `public/uploads/3d-models/${filename}`;

            deleteFile(filePath);

            logger.info("3D model deleted", { filename });

            return {
                success: true,
                message: "3D model deleted successfully",
            };
        } catch (error: any) {
            logger.error("Error deleting 3D model", {
                error: error.message,
                filename,
            });

            return {
                success: false,
                message: "Failed to delete 3D model",
            };
        }
    }
}
