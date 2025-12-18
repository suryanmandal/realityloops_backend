import { Router } from "express";
import authRouter from "./authRouter";

const staffRouter = Router();

staffRouter.use("/auth", authRouter);
// Future staff routes
// staffRouter.use("/profile", profileRouter);
// staffRouter.use("/orders", ordersRouter);

export default staffRouter;
