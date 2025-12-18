import { Request, Response } from "express";
import { RestaurantAuthService } from "../services/restaurant.auth.service";
import { logger } from "../utils/logger";

/**
 * Restaurant Auth Controller Class
 */
export class RestaurantAuthController {
  /**
   * @route   POST /api/v1/restaurant/auth/signup
   * @desc    Register new restaurant
   * @access  Public
   */
  static async signup(req: Request, res: Response): Promise<Response> {
    try {
      const result = await RestaurantAuthService.signup(req.body);
      const statusCode = result.success ? 201 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Restaurant signup controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/restaurant/auth/verify-email
   * @desc    Verify email with OTP
   * @access  Public
   */
  static async verifyEmail(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp } = req.body;
      const result = await RestaurantAuthService.verifyEmail(email, otp);
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Restaurant verify email controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/restaurant/auth/login
   * @desc    Login restaurant
   * @access  Public
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const result = await RestaurantAuthService.login(email, password);
      const statusCode = result.success ? 200 : 401;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Restaurant login controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/restaurant/auth/resend-otp
   * @desc    Resend OTP
   * @access  Public
   */
  static async resendOTP(req: Request, res: Response): Promise<Response> {
    try {
      const { email } = req.body;
      const result = await RestaurantAuthService.resendOTP(email);
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Restaurant resend OTP controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/restaurant/auth/forgot-password
   * @desc    Send password reset OTP
   * @access  Public
   */
  static async forgotPassword(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const { email } = req.body;
      const result = await RestaurantAuthService.forgotPassword(email);
      return res.status(200).json(result);
    } catch (error: any) {
      logger.error("Restaurant forgot password controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/restaurant/auth/reset-password
   * @desc    Reset password with OTP
   * @access  Public
   */
  static async resetPassword(req: Request, res: Response): Promise<Response> {
    try {
      const { email, otp, newPassword } = req.body;
      const result = await RestaurantAuthService.resetPassword(
        email,
        otp,
        newPassword
      );
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Restaurant reset password controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/restaurant/auth/add-staff
   * @desc    Add staff member
   * @access  Private (Restaurant only)
   */
  static async addStaff(req: Request, res: Response): Promise<Response> {
    try {
      const restaurantId = req.user?.id;

      if (!restaurantId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const result = await RestaurantAuthService.addStaff(
        restaurantId,
        req.body
      );
      const statusCode = result.success ? 201 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Restaurant add staff controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
