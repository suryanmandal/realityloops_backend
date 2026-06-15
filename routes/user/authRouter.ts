import { Router } from "express";
import { signup, login } from "../../controllers/userController";

const authRouter = Router();

authRouter.post("/signup", signup);
authRouter.post("/login", login);
authRouter.post("/verify-otp");
authRouter.post("/forgot-password");
authRouter.post("/forgot-password/verify-otp"); // verify otp for forgot password
authRouter.post("/reset-password");
authRouter.post("/google-auth");

export default authRouter;
