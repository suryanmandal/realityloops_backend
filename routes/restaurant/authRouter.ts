import { Router } from "express";
import { RestaurantAuthController } from "../../controllers/restaurant.controller";
import { validate } from "../../middleware/validation.middleware";
import { authenticate, isRestaurant } from "../../middleware/auth.middleware";
import {
  restaurantSignupSchema,
  loginSchema,
  verifyOTPSchema,
  resendOTPSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  addStaffSchema,
} from "../../validation/auth.validation";

const restaurantAuthRouter = Router();

// Public routes
restaurantAuthRouter.post(
  "/signup",
  validate(restaurantSignupSchema),
  RestaurantAuthController.signup
);

restaurantAuthRouter.post(
  "/verify-email",
  validate(verifyOTPSchema),
  RestaurantAuthController.verifyEmail
);

restaurantAuthRouter.post(
  "/login",
  validate(loginSchema),
  RestaurantAuthController.login
);

restaurantAuthRouter.post(
  "/resend-otp",
  validate(resendOTPSchema),
  RestaurantAuthController.resendOTP
);

restaurantAuthRouter.post(
  "/forgot-password",
  validate(forgotPasswordSchema),
  RestaurantAuthController.forgotPassword
);

restaurantAuthRouter.post(
  "/reset-password",
  validate(resetPasswordSchema),
  RestaurantAuthController.resetPassword
);

// Protected routes (Restaurant only)
restaurantAuthRouter.post(
  "/add-staff",
  authenticate,
  isRestaurant,
  validate(addStaffSchema),
  RestaurantAuthController.addStaff
);

export default restaurantAuthRouter;
