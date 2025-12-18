import { Router } from "express";
import authRouter from "./authRouter";

const restaurantRouter = Router();

restaurantRouter.use("/auth", authRouter);
// Future routes can be added here
// restaurantRouter.use("/profile", profileRouter);
// restaurantRouter.use("/staff", staffRouter);
// restaurantRouter.use("/orders", ordersRouter);

export default restaurantRouter;
