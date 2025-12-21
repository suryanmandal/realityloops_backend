import { Router } from "express";
import authRouter from "./authRouter";
import uploadRouter from "./uploadRouter";
import { authenticate, isAdmin } from "../../middleware/auth.middleware";

const adminRouter = Router();

adminRouter.use("/auth", authRouter);

// Protected admin routes (require authentication + admin role)
adminRouter.use("/upload", authenticate, isAdmin, uploadRouter);

// Future admin routes
// adminRouter.use("/restaurants", restaurantsRouter);
// adminRouter.use("/analytics", analyticsRouter);
// adminRouter.use("/users", usersRouter);

export default adminRouter;
