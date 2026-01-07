import { Router } from "express";
import { PublicController } from "../controllers/public.controller";

const publicRouter = Router();

// Public API routes
publicRouter.get("/products", PublicController.getProducts);
publicRouter.get("/restaurants", PublicController.getRestaurants);

export default publicRouter;
