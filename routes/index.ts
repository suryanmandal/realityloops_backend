import { Router } from "express";
import userRouter from "./user";
import sellerRouter from "./seller";
import adminRouter from "./admin";
import restaurantRouter from "./restaurant";
import staffRouter from "./staff";

const apiRouter = Router();

// Customer routes (no authentication needed for browsing)
apiRouter.use("/user", userRouter);

// Restaurant/Seller routes (authenticated)
apiRouter.use("/restaurant", restaurantRouter);
apiRouter.use("/seller", sellerRouter); // Backwards compatibility

// Staff routes (authenticated)
apiRouter.use("/staff", staffRouter);

// Admin routes (authenticated)
apiRouter.use("/admin", adminRouter);

export default apiRouter;
