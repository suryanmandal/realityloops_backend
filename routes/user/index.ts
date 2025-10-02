import { Router } from 'express';
import authRouter from './authRouter';

const userRouter = Router();

userRouter.use("/auth", authRouter);
// userRouter.use("/account");
// userRouter.use("/cart");
// userRouter.use("/notification");
// userRouter.use("/checkout");
// userRouter.use("/chat");
// userRouter.use("/order");
// userRouter.use("/product");
// userRouter.use("/seller");

export default userRouter;