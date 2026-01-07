import { Router } from "express";
import { RestaurantProfileController } from "../../controllers/restaurant.profile.controller";
import { authenticate, isRestaurant } from "../../middleware/auth.middleware";

const staffRouter = Router();

// All staff routes require authentication and restaurant role
staffRouter.use(authenticate, isRestaurant);

// Staff management routes
staffRouter.get("/staff", RestaurantProfileController.getRestaurantStaff);
staffRouter.delete("/staff/:staffId", RestaurantProfileController.deleteRestaurantStaff);

export default staffRouter;
