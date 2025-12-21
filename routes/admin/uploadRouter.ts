import { Router } from "express";
import { UploadController } from "../../controllers/upload.controller";
import { uploadAdmin3DModel } from "../../middleware/upload.middleware";

const uploadRouter = Router();

/**
 * @route   POST /api/v1/admin/upload/3d-model
 * @desc    Upload 3D model file
 * @access  Private (Admin only)
 */
uploadRouter.post("/3d-model", uploadAdmin3DModel, UploadController.upload3DModel);

/**
 * @route   DELETE /api/v1/admin/upload/3d-model/:filename
 * @desc    Delete 3D model file
 * @access  Private (Admin only)
 */
uploadRouter.delete("/3d-model/:filename", UploadController.delete3DModel);

export default uploadRouter;
