import { Request, Response } from "express";
import { UploadService } from "../services/upload.service";
import { logger } from "../utils/logger";

/**
 * Upload Controller Class
 * Handles file upload HTTP requests
 */
export class UploadController {
    /**
     * @route   POST /api/v1/admin/upload/3d-model
     * @desc    Upload 3D model file (admin only)
     * @access  Private (Admin)
     */
    static async upload3DModel(req: Request, res: Response): Promise<Response> {
        try {
            // Get uploaded file from multer
            const file = req.file;

            // Get base URL from request
            const protocol = req.protocol;
            const host = req.get("host");
            const baseUrl = `${protocol}://${host}`;

            // Process upload
            const result = await UploadService.process3DModelUpload(file, baseUrl);

            const statusCode = result.success ? 201 : 400;
            return res.status(statusCode).json(result);
        } catch (error: any) {
            logger.error("Upload 3D model controller error", {
                error: error.message,
            });

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    /**
     * @route   POST /api/v1/admin/upload/3d-model/:productId
     * @desc    Upload 3D model file and update product AR model path (admin only)
     * @access  Private (Admin)
     */
    static async upload3DModelAndUpdateProduct(req: Request, res: Response): Promise<Response> {
        try {
            // Get uploaded file from multer
            const file = req.file;
            const { productId } = req.params;

            // Process upload and update product
            const result = await UploadService.process3DModelUploadAndUpdateProduct(file, productId);

            const statusCode = result.success ? 201 : 400;
            return res.status(statusCode).json(result);
        } catch (error: any) {
            logger.error("Upload 3D model and update product controller error", {
                error: error.message,
            });

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }

    /**
     * @route   DELETE /api/v1/admin/upload/3d-model/:filename
     * @desc    Delete 3D model file (admin only)
     * @access  Private (Admin)
     */
    static async delete3DModel(req: Request, res: Response): Promise<Response> {
        try {
            const { filename } = req.params;

            if (!filename) {
                return res.status(400).json({
                    success: false,
                    message: "Filename is required",
                });
            }

            const result = await UploadService.delete3DModel(filename);

            const statusCode = result.success ? 200 : 400;
            return res.status(statusCode).json(result);
        } catch (error: any) {
            logger.error("Delete 3D model controller error", {
                error: error.message,
            });

            return res.status(500).json({
                success: false,
                message: "Internal server error",
            });
        }
    }
}
