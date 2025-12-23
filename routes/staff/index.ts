import { Router } from "express";
import authRouter from "./authRouter";
import orderRouter from "./orderRouter";

const staffRouter = Router();

staffRouter.use("/auth", authRouter);
staffRouter.use("/orders", orderRouter);
// Future staff routes
// staffRouter.use("/profile", profileRouter);

export default staffRouter;

