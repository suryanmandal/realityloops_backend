import { Staff, Restaurant } from "../models";
import { JWTService } from "./jwt.service";
import { logger } from "../utils/logger";
import { UserRole, AccountStatus } from "../types/enums";
import { IJWTPayload, IAuthResponse } from "../types/interfaces";

/**
 * Staff Auth Service Class
 */
export class StaffAuthService {
  /**
   * Staff login
   */
  static async login(email: string, password: string): Promise<IAuthResponse> {
    try {
      const staff = await Staff.findOne({ email })
        .select("+password")
        .populate("restaurantId", "restaurantName status");

      if (!staff || !(await staff.comparePassword(password))) {
        return { success: false, message: "Invalid email or password" };
      }

      const restaurant = staff.restaurantId as any;

      // Check if staff account is active
      if (staff.status !== AccountStatus.ACTIVE) {
        return {
          success: false,
          message: "Your account is not active. Please contact your manager.",
        };
      }

      // Check if restaurant is active
      if (restaurant && restaurant.status !== AccountStatus.ACTIVE) {
        return {
          success: false,
          message: "Restaurant account is not active. Please contact support.",
        };
      }

      const payload: IJWTPayload = {
        id: (staff._id as any).toString(),
        email: staff.email,
        role: staff.role,
        staffRole: staff.staffRole,
        restaurantId: (staff.restaurantId as any)._id.toString(),
      };

      const token = JWTService.generateAccessToken(payload);
      const refreshToken = JWTService.generateRefreshToken(payload);

      staff.lastLogin = new Date();
      await staff.save();

      logger.info("Staff logged in", { staffId: staff._id });

      return {
        success: true,
        message: "Logged in successfully",
        data: {
          user: {
            id: staff._id,
            name: staff.name,
            email: staff.email,
            role: staff.role,
            staffRole: staff.staffRole,
            status: staff.status,
            restaurantId: (staff.restaurantId as any)._id,
            restaurantName: restaurant?.restaurantName,
          },
          token,
          refreshToken,
        },
      };
    } catch (error: any) {
      logger.error("Error in staff login", { error: error.message });
      return { success: false, message: "Login failed." };
    }
  }

  /**
   * Change password (for first-time login or password update)
   */
  static async changePassword(
    staffId: string,
    currentPassword: string,
    newPassword: string
  ): Promise<IAuthResponse> {
    try {
      const staff = await Staff.findById(staffId).select("+password");

      if (!staff) {
        return { success: false, message: "Staff member not found" };
      }

      const isPasswordValid = await staff.comparePassword(currentPassword);

      if (!isPasswordValid) {
        return { success: false, message: "Current password is incorrect" };
      }

      staff.password = newPassword;
      await staff.save();

      logger.info("Staff password changed", { staffId: staff._id });

      return {
        success: true,
        message: "Password changed successfully",
      };
    } catch (error: any) {
      logger.error("Error changing staff password", { error: error.message });
      return { success: false, message: "Failed to change password." };
    }
  }
}
