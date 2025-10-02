import { Router } from "express";
import userRouter from "./user";
import sellerRouter from "./seller";
import adminRouter from "./admin";

const apiRouter = Router();

apiRouter.use("/user", userRouter);
apiRouter.use("/seller", sellerRouter);
apiRouter.use("/admin", adminRouter);

export default apiRouter;