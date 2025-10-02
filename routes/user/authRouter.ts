import { Router } from "express";
const authRouter = Router();

authRouter.post("/login",);
authRouter.post("/signup",);
authRouter.post("/verify-otp",);
authRouter.post("/forgot-password",);
authRouter.post("/forgot-password/verify-otp",);// verify otp for forgot password
authRouter.post("/reset-password",);
authRouter.post("/google-auth",);

export default authRouter;