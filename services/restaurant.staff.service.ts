import { Staff } from "../models";
import { logger } from "../utils/logger";
import { Types } from "mongoose";

export class RestaurantStaffService {
  /**
   * Get all staff members for a restaurant
   */
  static async getRestaurantStaff(restaurantId: string) {
    try {
      if (!Types.ObjectId.isValid(restaurantId)) {
        return {
          success: false,
          message: "Invalid restaurant ID",
        };
      }

      const staffMembers = await Staff.find({ restaurantId })
        .select("-password")
        .sort({ createdAt: -1 });

      return {
        success: true,
        message: "Staff members retrieved successfully",
        data: {
          staff: staffMembers,
          count: staffMembers.length,
        },
      };
    } catch (error: any) {
      logger.error("Error getting restaurant staff", {
        error: error.message,
        restaurantId,
      });
      return {
        success: false,
        message: "Failed to get staff members",
      };
    }
  }

  /**
   * Delete a staff member
   */
  static async deleteRestaurantStaff(restaurantId: string, staffId: string) {
    try {
      if (!Types.ObjectId.isValid(restaurantId)) {
        return {
          success: false,
          message: "Invalid restaurant ID",
        };
      }

      if (!Types.ObjectId.isValid(staffId)) {
        return {
          success: false,
          message: "Invalid staff ID",
        };
      }

      const staff = await Staff.findOne({
        _id: staffId,
        restaurantId,
      });

      if (!staff) {
        return {
          success: false,
          message: "Staff member not found",
        };
      }

      await Staff.findByIdAndDelete(staffId);

      logger.info("Staff member deleted", {
        staffId,
        restaurantId,
      });

      return {
        success: true,
        message: "Staff member deleted successfully",
        data: { staff },
      };
    } catch (error: any) {
      logger.error("Error deleting staff member", {
        error: error.message,
        staffId,
        restaurantId,
      });
      return {
        success: false,
        message: "Failed to delete staff member",
      };
    }
  }
}
