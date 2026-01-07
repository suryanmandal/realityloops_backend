import { Router } from "express";
import { RestaurantProfileController } from "../../controllers/restaurant.profile.controller";
import { authenticate, isRestaurant } from "../../middleware/auth.middleware";

const accountRouter = Router();

// All account routes require authentication and restaurant role
accountRouter.use(authenticate, isRestaurant);

// Account routes
accountRouter.get("/account", RestaurantProfileController.getRestaurantAccount);
accountRouter.put("/account", RestaurantProfileController.updateRestaurantAccount);
accountRouter.delete("/account", RestaurantProfileController.deleteRestaurantAccount);

// Dashboard routes
accountRouter.get("/dashboard", RestaurantProfileController.getRestaurantDashboard);
accountRouter.get("/dashboard/analytics", RestaurantProfileController.getRestaurantAnalytics);

export default accountRouter;
