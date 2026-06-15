import { Router } from "express";
import { StaffAuthController } from "../../controllers/staff.controller";
import { validate } from "../../middleware/validation.middleware";
import { authenticate, isStaff } from "../../middleware/auth.middleware";
import {
  loginSchema,
  changePasswordSchema,
} from "../../validation/auth.validation";

const staffAuthRouter = Router();

// Public routes
staffAuthRouter.post(
  "/login",
  validate(loginSchema),
  StaffAuthController.login
);

// Protected routes (Staff only)
staffAuthRouter.post(
  "/change-password",
  authenticate,
  isStaff,
  validate(changePasswordSchema),
  StaffAuthController.changePassword
);

export default staffAuthRouter;
