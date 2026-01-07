import { Router } from "express";
import authRouter from "./authRouter";
import categoryRouter from "./categoryRouter";
import productRouter from "./productRouter";
import accountRouter from "./accountRouter";

const restaurantRouter = Router();

restaurantRouter.use("/auth", authRouter);
restaurantRouter.use("/category", categoryRouter);
restaurantRouter.use("/product", productRouter);
restaurantRouter.use("", accountRouter); // Account and dashboard routes
// Future routes can be added here
// restaurantRouter.use("/profile", profileRouter);
// restaurantRouter.use("/staff", staffRouter);
// restaurantRouter.use("/orders", ordersRouter);

export default restaurantRouter;
