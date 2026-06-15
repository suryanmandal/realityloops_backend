import { Router } from "express";
import { ForgeController } from "../controllers";
import { uploadProductImage } from "../middleware/upload.middleware";

const forgeRouter = Router();

// Route to generate a new 3D AR model
forgeRouter.post("/generate", uploadProductImage, ForgeController.generate);

// Route to get all public experiences (feed library)
forgeRouter.get("/feed", ForgeController.getFeed);

// Route to get details for a single experience
forgeRouter.get("/experience/:id", ForgeController.getExperience);

export default forgeRouter;
