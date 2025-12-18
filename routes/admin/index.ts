import { Router } from "express";
import authRouter from "./authRouter";

const adminRouter = Router();

adminRouter.use("/auth", authRouter);
// Future admin routes
// adminRouter.use("/restaurants", restaurantsRouter);
// adminRouter.use("/analytics", analyticsRouter);
// adminRouter.use("/users", usersRouter);

export default adminRouter;
