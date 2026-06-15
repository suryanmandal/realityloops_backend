import { OTP } from "../models";
import { OTPType } from "../types/enums";
import { OTPUtil } from "../utils/otp.util";
import { EmailService } from "../utils/email.service";
import { logger } from "../utils/logger";

/**
 * OTP Service Class
 */
export class OTPService {
  private static readonly MAX_OTP_ATTEMPTS = 5;
  private static readonly OTP_EXPIRY_MINUTES = 10;

  /**
   * Generate and send OTP
   */
  static async generateAndSendOTP(
    email: string,
    name: string,
    otpType: OTPType
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Generate OTP
      const otpCode = OTPUtil.generateOTP();
      const expiresAt = OTPUtil.generateOTPExpiry(this.OTP_EXPIRY_MINUTES);

      // Delete any existing unused OTPs for this email and type
      await OTP.deleteMany({
        email,
        otpType,
        isUsed: false,
      });

      // Save new OTP
      await OTP.create({
        email,
        otp: otpCode,
        otpType,
        expiresAt,
        isUsed: false,
        attempts: 0,
      });

      // Send OTP email
      const emailSent = await EmailService.sendOTPEmail(
        email,
        name,
        otpCode,
        otpType
      );

      if (!emailSent) {
        logger.error("Failed to send OTP email", { email, otpType });
        return {
          success: false,
          message: "Failed to send OTP email. Please try again.",
        };
      }

      logger.info("OTP generated and sent", { email, otpType });
      return {
        success: true,
        message: "OTP sent successfully to your email",
      };
    } catch (error: any) {
      logger.error("Error generating and sending OTP", {
        error: error.message,
        email,
        otpType,
      });
      return {
        success: false,
        message: "Failed to generate OTP. Please try again.",
      };
    }
  }

  /**
   * Verify OTP
   */
  static async verifyOTP(
    email: string,
    otpCode: string,
    otpType: OTPType
  ): Promise<{ success: boolean; message: string }> {
    try {
      // Find the OTP
      const otpRecord = await OTP.findOne({
        email,
        otpType,
        isUsed: false,
      }).sort({ createdAt: -1 });

      if (!otpRecord) {
        logger.warn("OTP not found or already used", { email, otpType });
        return {
          success: false,
          message: "Invalid OTP or OTP has expired",
        };
      }

      // Check if OTP is expired
      if (OTPUtil.isOTPExpired(otpRecord.expiresAt)) {
        logger.warn("OTP expired", { email, otpType });
        return {
          success: false,
          message: "OTP has expired. Please request a new one.",
        };
      }

      // Check max attempts
      if (otpRecord.attempts >= this.MAX_OTP_ATTEMPTS) {
        logger.warn("Max OTP attempts reached", { email, otpType });
        return {
          success: false,
          message: "Too many failed attempts. Please request a new OTP.",
        };
      }

      // Verify OTP
      if (otpRecord.otp !== otpCode) {
        // Increment attempts
        otpRecord.attempts += 1;
        await otpRecord.save();

        logger.warn("Invalid OTP entered", {
          email,
          otpType,
          attempts: otpRecord.attempts,
        });

        return {
          success: false,
          message: `Invalid OTP. ${
            this.MAX_OTP_ATTEMPTS - otpRecord.attempts
          } attempts remaining.`,
        };
      }

      // Mark OTP as used
      otpRecord.isUsed = true;
      await otpRecord.save();

      logger.info("OTP verified successfully", { email, otpType });
      return {
        success: true,
        message: "OTP verified successfully",
      };
    } catch (error: any) {
      logger.error("Error verifying OTP", {
        error: error.message,
        email,
        otpType,
      });
      return {
        success: false,
        message: "Failed to verify OTP. Please try again.",
      };
    }
  }

  /**
   * Delete OTPs for an email
   */
  static async deleteOTPs(email: string, otpType?: OTPType): Promise<void> {
    try {
      const query: any = { email };
      if (otpType) {
        query.otpType = otpType;
      }
      await OTP.deleteMany(query);
      logger.info("OTPs deleted", { email, otpType });
    } catch (error: any) {
      logger.error("Error deleting OTPs", { error: error.message, email });
    }
  }
}
