import { Request, Response } from "express";
import { AdminAuthService } from "../services/admin.auth.service";
import { logger } from "../utils/logger";

/**
 * Admin Auth Controller Class
 */
export class AdminAuthController {
  /**
   * @route   POST /api/v1/admin/auth/signup
   * @desc    Register new admin
   * @access  Public
   */
  static async signup(req: Request, res: Response): Promise<Response> {
    try {
      const result = await AdminAuthService.signup(req.body);
      const statusCode = result.success ? 201 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Admin signup controller error", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/admin/auth/verify-email
   * @desc    Verify email with OTP
   * @access  Public
   */
  static async verifyEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp } = req.body;
      const result = await AdminAuthService.verifyEmail(email, otp);
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Admin verify email controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/admin/auth/login
   * @desc    Login admin
   * @access  Public
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const result = await AdminAuthService.login(email, password);
      const statusCode = result.success ? 200 : 401;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Admin login controller error", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/admin/auth/resend-otp
   * @desc    Resend OTP
   * @access  Public
   */
  static async resendOTP(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const result = await AdminAuthService.resendOTP(email);
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Admin resend OTP controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/admin/auth/forgot-password
   * @desc    Send password reset OTP
   * @access  Public
   */
  static async forgotPassword(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { email } = req.body;
      const result = await AdminAuthService.forgotPassword(email);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Admin forgot password controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/admin/auth/reset-password
   * @desc    Reset password with OTP
   * @access  Public
   */
  static async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await AdminAuthService.resetPassword(
        email,
        otp,
        newPassword
      );
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Admin reset password controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
