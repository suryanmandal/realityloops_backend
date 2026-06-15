import { Router } from "express";
import { PublicController } from "../controllers/public.controller";
import { FurniturePublicController } from "../controllers/furniture.public.controller";

const publicRouter = Router();

// Public API routes
publicRouter.get("/products", PublicController.getProducts);
publicRouter.get("/restaurants", PublicController.getRestaurants);

// Furniture API routes
publicRouter.get("/furniture/products", FurniturePublicController.getProducts);
publicRouter.get("/furniture/stores", FurniturePublicController.getStores);

export default publicRouter;
