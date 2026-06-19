import { Request, Response } from "express";
import { SystemSetting } from "../models";
import { logger } from "../utils/logger";

/**
 * Controller to handle global system settings configurations (Admin access only)
 */
export class SettingsController {
  /**
   * Get all system settings (masking secret keys for safety)
   */
  static async getSettings(req: Request, res: Response): Promise<Response> {
    try {
      const settings = await SystemSetting.find({});
      const result: { [key: string]: string } = {};

      settings.forEach((s) => {
        if (s.key === "tripo_api_key") {
          result[s.key] = s.value ? "********" : "";
        } else {
          result[s.key] = s.value;
        }
      });

      // Provide defaults if not seeded yet
      if (result.tripo_passcode === undefined) result.tripo_passcode = "premium3d";
      if (result.tripo_api_key === undefined) result.tripo_api_key = "";
      if (result.custom_gpu_url === undefined) result.custom_gpu_url = "";

      return res.status(200).json({
        success: true,
        message: "Settings retrieved successfully",
        data: result,
      });
    } catch (error: any) {
      logger.error("Get system settings controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error retrieving settings",
      });
    }
  }

  /**
   * Update system settings
   */
  static async updateSettings(req: Request, res: Response): Promise<Response> {
    try {
      const { tripo_passcode, tripo_api_key, custom_gpu_url } = req.body;

      if (tripo_passcode !== undefined) {
        await SystemSetting.findOneAndUpdate(
          { key: "tripo_passcode" },
          { value: tripo_passcode.trim() },
          { upsert: true, new: true }
        );
      }

      // Only update API key if it has been modified from the masked version
      if (tripo_api_key !== undefined && tripo_api_key !== "********") {
        await SystemSetting.findOneAndUpdate(
          { key: "tripo_api_key" },
          { value: tripo_api_key.trim() },
          { upsert: true, new: true }
        );
      }

      if (custom_gpu_url !== undefined) {
        await SystemSetting.findOneAndUpdate(
          { key: "custom_gpu_url" },
          { value: custom_gpu_url.trim() },
          { upsert: true, new: true }
        );
      }

      return res.status(200).json({
        success: true,
        message: "System settings updated successfully",
      });
    } catch (error: any) {
      logger.error("Update system settings controller error", {
        error: error.message,
      });
      return res.status(500).json({
        success: false,
        message: "Internal server error updating settings",
      });
    }
  }
}
