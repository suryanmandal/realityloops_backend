import { Router } from "express";
import { RestaurantAdminController } from "../../controllers/restaurant.admin.controller";
import { authenticate, isAdmin } from "../../middleware/auth.middleware";

const restaurantAdminRouter = Router();

// All restaurant admin routes require authentication and admin role
restaurantAdminRouter.use(authenticate, isAdmin);

// Get all restaurants
restaurantAdminRouter.get("/all", RestaurantAdminController.getAllRestaurants);

// Get dashboard stats
restaurantAdminRouter.get("/dashboard/stats", RestaurantAdminController.getDashboardStats);

// Get restaurant by ID
restaurantAdminRouter.get("/:id", RestaurantAdminController.getRestaurantById);

// Get products by restaurant ID
restaurantAdminRouter.get("/products/:id", RestaurantAdminController.getRestaurantProducts);

// Get product by ID
restaurantAdminRouter.get("/product/:id", RestaurantAdminController.getProductById);

// Restaurant account routes (GET, PUT, DELETE)
restaurantAdminRouter.get("/account/:id", RestaurantAdminController.getRestaurantAccount);
restaurantAdminRouter.put("/account/:id", RestaurantAdminController.updateRestaurantAccount);
restaurantAdminRouter.delete("/account/:id", RestaurantAdminController.deleteRestaurantAccount);

export default restaurantAdminRouter;
