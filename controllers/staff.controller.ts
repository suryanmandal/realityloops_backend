import { Request, Response } from "express";
import { StaffAuthService } from "../services/staff.auth.service";
import { logger } from "../utils/logger";

/**
 * Staff Auth Controller Class
 */
export class StaffAuthController {
  /**
   * @route   POST /api/v1/staff/auth/login
   * @desc    Login staff
   * @access  Public
   */
  static async login(req: Request, res: Response): Promise<Response> {
    try {
      const { email, password } = req.body;
      const result = await StaffAuthService.login(email, password);
      const statusCode = result.success ? 200 : 401;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Staff login controller error", { error: error.message });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }

  /**
   * @route   POST /api/v1/staff/auth/change-password
   * @desc    Change password
   * @access  Private (Staff only)
   */
  static async changePassword(
    req: Request,
    res: Response
  ): Promise<Response> {
    try {
      const staffId = req.user?.id;

      if (!staffId) {
        return res.status(401).json({
          success: false,
          message: "Unauthorized",
        });
      }

      const { currentPassword, newPassword } = req.body;
      const result = await StaffAuthService.changePassword(
        staffId,
        currentPassword,
        newPassword
      );
      const statusCode = result.success ? 200 : 400;
      return res.status(statusCode).json(result);
    } catch (error: any) {
      logger.error("Staff change password controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error",
      });
    }
  }
}
