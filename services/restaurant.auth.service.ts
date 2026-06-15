import { Restaurant, Staff } from "../models";
import { JWTService } from "./jwt.service";
import { OTPService } from "./otp.service";
import { EmailService } from "../utils/email.service";
import { logger } from "../utils/logger";
import {
  UserRole,
  AccountStatus,
  OTPType,
  StaffRole,
} from "../types/enums";
import { IJWTPayload, IAuthResponse } from "../types/interfaces";
import crypto from "crypto";

/**
 * Restaurant Auth Service Class
 */
export class RestaurantAuthService {
  /**
   * Register new restaurant
   */
  static async signup(data: {
    restaurantName: string;
    ownerName: string;
    email: string;
    phone: string;
    password: string;
    address?: string;
  }): Promise<IAuthResponse> {
    try {
      // Check if restaurant already exists
      const existingRestaurant = await Restaurant.findOne({
        email: data.email,
      });

      if (existingRestaurant) {
        logger.warn("Restaurant registration attempt with existing email", {
          email: data.email,
        });
        return {
          success: false,
          message: "A restaurant with this email already exists",
        };
      }

      // Create restaurant
      const restaurant = await Restaurant.create({
        restaurantName: data.restaurantName,
        ownerName: data.ownerName,
        email: data.email,
        phone: data.phone,
        password: data.password,
        address: data.address,
        role: UserRole.RESTAURANT,
        status: AccountStatus.PENDING_VERIFICATION,
        isEmailVerified: false,
      });

      // Generate and send OTP
      const otpResult = await OTPService.generateAndSendOTP(
        restaurant.email,
        restaurant.ownerName,
        OTPType.EMAIL_VERIFICATION
      );

      if (!otpResult.success) {
        // Rollback - delete restaurant
        await Restaurant.findByIdAndDelete(restaurant._id);
        logger.error("Failed to send OTP after restaurant creation", {
          email: data.email,
        });
        return {
          success: false,
          message: "Failed to send verification email. Please try again.",
        };
      }

      logger.info("Restaurant registered successfully", {
        restaurantId: restaurant._id,
        email: restaurant.email,
      });

      return {
        success: true,
        message:
          "Restaurant registered successfully. Please verify your email with the OTP sent to your email address.",
        data: {
          user: {
            id: restaurant._id,
            restaurantName: restaurant.restaurantName,
            ownerName: restaurant.ownerName,
            email: restaurant.email,
            phone: restaurant.phone,
            role: restaurant.role,
            status: restaurant.status,
            isEmailVerified: restaurant.isEmailVerified,
          },
        },
      };
    } catch (error: any) {
      logger.error("Error in restaurant signup", { error: error.message });
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  }

  /**
   * Verify email with OTP
   */
  static async verifyEmail(
    email: string,
    otp: string
  ): Promise<IAuthResponse> {
    try {
      // Verify OTP
      const otpResult = await OTPService.verifyOTP(
        email,
        otp,
        OTPType.EMAIL_VERIFICATION
      );

      if (!otpResult.success) {
        return {
          success: false,
          message: otpResult.message,
        };
      }

      // Update restaurant
      const restaurant = await Restaurant.findOneAndUpdate(
        { email },
        {
          isEmailVerified: true,
          status: AccountStatus.ACTIVE,
        },
        { new: true }
      );

      if (!restaurant) {
        logger.error("Restaurant not found during email verification", {
          email,
        });
        return {
          success: false,
          message: "Restaurant not found",
        };
      }

      // Generate tokens
      const payload: IJWTPayload = {
        id: (restaurant._id as any).toString(),
        email: restaurant.email,
        role: restaurant.role,
      };

      const token = JWTService.generateAccessToken(payload);
      const refreshToken = JWTService.generateRefreshToken(payload);

      // Update last login
      restaurant.lastLogin = new Date();
      await restaurant.save();

      logger.info("Restaurant email verified successfully", {
        restaurantId: restaurant._id,
        email: restaurant.email,
      });

      return {
        success: true,
        message: "Email verified successfully",
        data: {
          user: {
            id: restaurant._id,
            restaurantName: restaurant.restaurantName,
            ownerName: restaurant.ownerName,
            email: restaurant.email,
            phone: restaurant.phone,
            role: restaurant.role,
            status: restaurant.status,
            isEmailVerified: restaurant.isEmailVerified,
          },
          token,
          refreshToken,
        },
      };
    } catch (error: any) {
      logger.error("Error verifying email", { error: error.message });
      return {
        success: false,
        message: "Email verification failed. Please try again.",
      };
    }
  }

  /**
   * Login restaurant
   */
  static async login(email: string, password: string): Promise<IAuthResponse> {
    try {
      // Find restaurant
      const restaurant = await Restaurant.findOne({ email }).select(
        "+password"
      );

      if (!restaurant) {
        logger.warn("Restaurant login attempt with non-existent email", {
          email,
        });
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Check password
      const isPasswordValid = await restaurant.comparePassword(password);

      if (!isPasswordValid) {
        logger.warn("Restaurant login attempt with invalid password", {
          email,
        });
        return {
          success: false,
          message: "Invalid email or password",
        };
      }

      // Check if email is verified
      if (!restaurant.isEmailVerified) {
        logger.warn("Restaurant login attempt with unverified email", {
          email,
        });

        // Resend OTP
        await OTPService.generateAndSendOTP(
          restaurant.email,
          restaurant.ownerName,
          OTPType.EMAIL_VERIFICATION
        );

        return {
          success: false,
          message:
            "Please verify your email first. A new OTP has been sent to your email.",
        };
      }

      // Check if account is active
      if (restaurant.status !== AccountStatus.ACTIVE) {
        logger.warn("Restaurant login attempt with inactive account", {
          email,
          status: restaurant.status,
        });
        return {
          success: false,
          message: "Your account is not active. Please contact support.",
        };
      }

      // Generate tokens
      const payload: IJWTPayload = {
        id: (restaurant._id as any).toString(),
        email: restaurant.email,
        role: restaurant.role,
      };

      const token = JWTService.generateAccessToken(payload);
      const refreshToken = JWTService.generateRefreshToken(payload);

      // Update last login
      restaurant.lastLogin = new Date();
      await restaurant.save();

      logger.info("Restaurant logged in successfully", {
        restaurantId: restaurant._id,
        email: restaurant.email,
      });

      return {
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: restaurant._id,
            restaurantName: restaurant.restaurantName,
            ownerName: restaurant.ownerName,
            email: restaurant.email,
            phone: restaurant.phone,
            role: restaurant.role,
            status: restaurant.status,
            isEmailVerified: restaurant.isEmailVerified,
            staffMembers: restaurant.staffMembers,
          },
          token,
          refreshToken,
        },
      };
    } catch (error: any) {
      logger.error("Error in restaurant login", { error: error.message });
      return {
        success: false,
        message: "Login failed. Please try again.",
      };
    }
  }

  /**
   * Resend OTP
   */
  static async resendOTP(email: string): Promise<IAuthResponse> {
    try {
      // Find restaurant
      const restaurant = await Restaurant.findOne({ email });

      if (!restaurant) {
        logger.warn("Resend OTP attempt for non-existent restaurant", {
          email,
        });
        return {
          success: false,
          message: "Restaurant not found",
        };
      }

      if (restaurant.isEmailVerified) {
        return {
          success: false,
          message: "Email is already verified",
        };
      }

      // Generate and send OTP
      const otpResult = await OTPService.generateAndSendOTP(
        restaurant.email,
        restaurant.ownerName,
        OTPType.EMAIL_VERIFICATION
      );

      return {
        success: otpResult.success,
        message: otpResult.message,
      };
    } catch (error: any) {
      logger.error("Error resending OTP", { error: error.message });
      return {
        success: false,
        message: "Failed to resend OTP. Please try again.",
      };
    }
  }

  /**
   * Forgot password - send OTP
   */
  static async forgotPassword(email: string): Promise<IAuthResponse> {
    try {
      // Find restaurant
      const restaurant = await Restaurant.findOne({ email });

      if (!restaurant) {
        // Don't reveal if email exists
        logger.warn("Forgot password attempt for non-existent restaurant", {
          email,
        });
        return {
          success: true,
          message:
            "If an account with this email exists, a password reset OTP has been sent.",
        };
      }

      // Generate and send OTP
      const otpResult = await OTPService.generateAndSendOTP(
        restaurant.email,
        restaurant.ownerName,
        OTPType.PASSWORD_RESET
      );

      return {
        success: true,
        message:
          "If an account with this email exists, a password reset OTP has been sent.",
      };
    } catch (error: any) {
      logger.error("Error in forgot password", { error: error.message });
      return {
        success: false,
        message: "Failed to process request. Please try again.",
      };
    }
  }

  /**
   * Reset password with OTP
   */
  static async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<IAuthResponse> {
    try {
      // Verify OTP
      const otpResult = await OTPService.verifyOTP(
        email,
        otp,
        OTPType.PASSWORD_RESET
      );

      if (!otpResult.success) {
        return {
          success: false,
          message: otpResult.message,
        };
      }

      // Find and update restaurant
      const restaurant = await Restaurant.findOne({ email });

      if (!restaurant) {
        logger.error("Restaurant not found during password reset", { email });
        return {
          success: false,
          message: "Restaurant not found",
        };
      }

      // Update password
      restaurant.password = newPassword;
      await restaurant.save();

      logger.info("Restaurant password reset successfully", {
        restaurantId: restaurant._id,
        email: restaurant.email,
      });

      return {
        success: true,
        message: "Password reset successfully. You can now login with your new password.",
      };
    } catch (error: any) {
      logger.error("Error resetting password", { error: error.message });
      return {
        success: false,
        message: "Password reset failed. Please try again.",
      };
    }
  }

  /**
   * Add staff member
   */
  static async addStaff(
    restaurantId: string,
    staffData: {
      name: string;
      email: string;
      staffRole: StaffRole;
      phone?: string;
    }
  ): Promise<IAuthResponse> {
    try {
      // Check if restaurant exists
      const restaurant = await Restaurant.findById(restaurantId);

      if (!restaurant) {
        logger.error("Restaurant not found when adding staff", {
          restaurantId,
        });
        return {
          success: false,
          message: "Restaurant not found",
        };
      }

      // Check if email already exists
      const existingStaff = await Staff.findOne({ email: staffData.email });

      if (existingStaff) {
        logger.warn("Attempt to add staff with existing email", {
          email: staffData.email,
        });
        return {
          success: false,
          message: "A staff member with this email already exists",
        };
      }

      // Check if restaurant already has 2 staff members
      if (restaurant.staffMembers && restaurant.staffMembers.length >= 2) {
        logger.warn("Attempt to add more than 2 staff members", {
          restaurantId,
        });
        return {
          success: false,
          message: "Maximum 2 staff members allowed per restaurant",
        };
      }

      // Generate temporary password
      const tempPassword = crypto.randomBytes(8).toString("hex");

      // Create staff
      const staff = await Staff.create({
        name: staffData.name,
        email: staffData.email,
        phone: staffData.phone,
        password: tempPassword,
        staffRole: staffData.staffRole,
        restaurantId: restaurant._id,
        addedBy: restaurant._id,
        role: UserRole.STAFF,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      });

      // Add staff to restaurant's staffMembers array
      restaurant.staffMembers = restaurant.staffMembers || [];
      restaurant.staffMembers.push(staff._id as any);
      await restaurant.save();

      // Send staff account email
      await EmailService.sendStaffAccountEmail(
        staff.email,
        staff.name,
        restaurant.restaurantName,
        tempPassword,
        staffData.staffRole
      );

      logger.info("Staff member added successfully", {
        staffId: staff._id,
        restaurantId: restaurant._id,
        email: staff.email,
      });

      return {
        success: true,
        message:
          "Staff member added successfully. Login credentials have been sent to their email.",
        data: {
          user: {
            id: staff._id,
            name: staff.name,
            email: staff.email,
            staffRole: staff.staffRole,
            role: staff.role,
            status: staff.status,
          },
        },
      };
    } catch (error: any) {
      logger.error("Error adding staff", { error: error.message });
      return {
        success: false,
        message: "Failed to add staff member. Please try again.",
      };
    }
  }
}
