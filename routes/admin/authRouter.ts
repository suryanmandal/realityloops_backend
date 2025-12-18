import { Router } from "express";
import { AdminAuthController } from "../../controllers/admin.controller";
import { validate } from "../../middleware/validation.middleware";
import {
  adminSignupSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "../../validation/auth.validation";

const adminAuthRouter = Router();

// Public routes
adminAuthRouter.post(
  "/signup",
  validate(adminSignupSchema),
  AdminAuthController.signup
);

adminAuthRouter.post(
  "/verify-email",
  validate(verifyOTPSchema),
  AdminAuthController.verifyEmail
);

adminAuthRouter.post(
  "/login",
  validate(loginSchema),
  AdminAuthController.login
);

adminAuthRouter.post(
  "/resend-otp",
  validate(resendOTPSchema),
  AdminAuthController.resendOTP
);

adminAuthRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  AdminAuthController.forgotPassword
);

adminAuthRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  AdminAuthController.resetPassword
);

export default adminAuthRouter;
