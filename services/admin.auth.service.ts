import { Admin } from "../models";
import { JWTService } from "./jwt.service";
import { OTPService } from "./otp.service";
import { logger } from "../utils/logger";
import { UserRole, AccountStatus, OTPType } from "../types/enums";
import { IJWTPayload, IAuthResponse } from "../types/interfaces";

/**
 * Admin Auth Service Class
 */
export class AdminAuthService {
  /**
   * Register new admin
   */
  static async signup(data: {
    name: string;
    email: string;
    phone?: string;
    password: string;
  }): Promise<IAuthResponse> {
    try {
      const existingAdmin = await Admin.findOne({ email: data.email });

      if (existingAdmin) {
        return {
          success: false,
          message: "An admin with this email already exists",
        };
      }

      const admin = await Admin.create({
        ...data,
        role: UserRole.ADMIN,
        status: AccountStatus.PENDING_VERIFICATION,
        isEmailVerified: false,
      });

      const otpResult = await OTPService.generateAndSendOTP(
        admin.email,
        admin.name,
        OTPType.EMAIL_VERIFICATION
      );

      if (!otpResult.success) {
        await Admin.findByIdAndDelete(admin._id);
        return {
          success: false,
          message: "Failed to send verification email. Please try again.",
        };
      }

      logger.info("Admin registered successfully", { adminId: admin._id });

      return {
        success: true,
        message:
          "Admin registered successfully. Please verify your email with the OTP sent.",
        data: {
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            status: admin.status,
          },
        },
      };
    } catch (error: any) {
      logger.error("Error in admin signup", { error: error.message });
      return {
        success: false,
        message: "Registration failed. Please try again.",
      };
    }
  }

  /**
   * Verify email
   */
  static async verifyEmail(
    email: string,
    otp: string
  ): Promise<IAuthResponse> {
    try {
      const otpResult = await OTPService.verifyOTP(
        email,
        otp,
        OTPType.EMAIL_VERIFICATION
      );

      if (!otpResult.success) {
        return { success: false, message: otpResult.message };
      }

      const admin = await Admin.findOneAndUpdate(
        { email },
        { isEmailVerified: true, status: AccountStatus.ACTIVE },
        { new: true }
      );

      if (!admin) {
        return { success: false, message: "Admin not found" };
      }

      const payload: IJWTPayload = {
        id: (admin._id as any).toString(),
        email: admin.email,
        role: admin.role,
      };

      const token = JWTService.generateAccessToken(payload);
      const refreshToken = JWTService.generateRefreshToken(payload);

      admin.lastLogin = new Date();
      await admin.save();

      logger.info("Admin email verified", { adminId: admin._id });

      return {
        success: true,
        message: "Email verified successfully",
        data: {
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            status: admin.status,
          },
          token,
          refreshToken,
        },
      };
    } catch (error: any) {
      logger.error("Error verifying admin email", { error: error.message });
      return {
        success: false,
        message: "Email verification failed.",
      };
    }
  }

  /**
   * Login admin
   */
  static async login(email: string, password: string): Promise<IAuthResponse> {
    try {
      const admin = await Admin.findOne({ email }).select("+password");

      if (!admin || !(await admin.comparePassword(password))) {
        return { success: false, message: "Invalid email or password" };
      }

      if (!admin.isEmailVerified) {
        await OTPService.generateAndSendOTP(
          admin.email,
          admin.name,
          OTPType.EMAIL_VERIFICATION
        );
        return {
          success: false,
          message: "Please verify your email. A new OTP has been sent.",
        };
      }

      if (admin.status !== AccountStatus.ACTIVE) {
        return {
          success: false,
          message: "Your account is not active. Please contact support.",
        };
      }

      const payload: IJWTPayload = {
        id: (admin._id as any).toString(),
        email: admin.email,
        role: admin.role,
      };

      const token = JWTService.generateAccessToken(payload);
      const refreshToken = JWTService.generateRefreshToken(payload);

      admin.lastLogin = new Date();
      await admin.save();

      logger.info("Admin logged in", { adminId: admin._id });

      return {
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: admin._id,
            name: admin.name,
            email: admin.email,
            role: admin.role,
            status: admin.status,
            permissions: admin.permissions,
          },
          token,
          refreshToken,
        },
      };
    } catch (error: any) {
      logger.error("Error in admin login", { error: error.message });
      return { success: false, message: "Login failed." };
    }
  }

  /**
   * Forgot password
   */
  static async forgotPassword(email: string): Promise<IAuthResponse> {
    try {
      const admin = await Admin.findOne({ email });

      if (admin) {
        await OTPService.generateAndSendOTP(
          admin.email,
          admin.name,
          OTPType.PASSWORD_RESET
        );
      }

      return {
        success: true,
        message: "If an account exists, a password reset OTP has been sent.",
      };
    } catch (error: any) {
      logger.error("Error in admin forgot password", { error: error.message });
      return { success: false, message: "Failed to process request." };
    }
  }

  /**
   * Reset password
   */
  static async resetPassword(
    email: string,
    otp: string,
    newPassword: string
  ): Promise<IAuthResponse> {
    try {
      const otpResult = await OTPService.verifyOTP(
        email,
        otp,
        OTPType.PASSWORD_RESET
      );

      if (!otpResult.success) {
        return { success: false, message: otpResult.message };
      }

      const admin = await Admin.findOne({ email });

      if (!admin) {
        return { success: false, message: "Admin not found" };
      }

      admin.password = newPassword;
      await admin.save();

      logger.info("Admin password reset", { adminId: admin._id });

      return {
        success: true,
        message: "Password reset successfully. You can now login.",
      };
    } catch (error: any) {
      logger.error("Error resetting admin password", { error: error.message });
      return { success: false, message: "Password reset failed." };
    }
  }

  /**
   * Resend OTP
   */
  static async resendOTP(email: string): Promise<IAuthResponse> {
    try {
      const admin = await Admin.findOne({ email });

      if (!admin) {
        return { success: false, message: "Admin not found" };
      }

      if (admin.isEmailVerified) {
        return { success: false, message: "Email is already verified" };
      }

      const otpResult = await OTPService.generateAndSendOTP(
        admin.email,
        admin.name,
        OTPType.EMAIL_VERIFICATION
      );

      return { success: otpResult.success, message: otpResult.message };
    } catch (error: any) {
      logger.error("Error resending admin OTP", { error: error.message });
      return { success: false, message: "Failed to resend OTP." };
    }
  }
}
