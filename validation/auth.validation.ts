import { z } from "zod";
import { StaffRole } from "../types/enums";

/**
 * Restaurant Signup Validation Schema
 */
export const restaurantSignupSchema = z.object({
  body: z.object({
    restaurantName: z
      .string()
      .min(2, "Restaurant name must be at least 2 characters")
      .max(100, "Restaurant name must not exceed 100 characters")
      .trim(),
    ownerName: z
      .string()
      .min(2, "Owner name must be at least 2 characters")
      .max(50, "Owner name must not exceed 50 characters")
      .trim(),
    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .trim(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must not exceed 50 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
    address: z.string().optional(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

/**
 * Admin Signup Validation Schema
 */
export const adminSignupSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .trim(),
    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .trim()
      .optional(),
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must not exceed 50 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

/**
 * Login Validation Schema
 */
export const loginSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    password: z
      .string()
      .min(1, "Password is required"),
  }),
});

/**
 * Verify OTP Validation Schema
 */
export const verifyOTPSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^[0-9]{6}$/, "OTP must contain only numbers"),
  }),
});

/**
 * Resend OTP Validation Schema
 */
export const resendOTPSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
  }),
});

/**
 * Forgot Password Validation Schema
 */
export const forgotPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
  }),
});

/**
 * Reset Password Validation Schema
 */
export const resetPasswordSchema = z.object({
  body: z.object({
    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    otp: z
      .string()
      .length(6, "OTP must be exactly 6 digits")
      .regex(/^[0-9]{6}$/, "OTP must contain only numbers"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must not exceed 50 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }),
});

/**
 * Add Staff Validation Schema
 */
export const addStaffSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(2, "Name must be at least 2 characters")
      .max(50, "Name must not exceed 50 characters")
      .trim(),
    email: z
      .string()
      .email("Invalid email address")
      .toLowerCase()
      .trim(),
    staffRole: z.enum([StaffRole.KITCHEN, StaffRole.WAITER_DESK], {
      message: "Invalid staff role",
    }),
    phone: z
      .string()
      .regex(/^[0-9]{10}$/, "Phone number must be 10 digits")
      .trim()
      .optional(),
  }),
});

/**
 * Change Password Validation Schema
 */
export const changePasswordSchema = z.object({
  body: z.object({
    currentPassword: z
      .string()
      .min(1, "Current password is required"),
    newPassword: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .max(50, "Password must not exceed 50 characters")
      .regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
        "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character"
      ),
    confirmPassword: z.string(),
  }).refine((data) => data.newPassword === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  }).refine((data) => data.currentPassword !== data.newPassword, {
    message: "New password must be different from current password",
    path: ["newPassword"],
  }),
});
