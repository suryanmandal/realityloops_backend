import crypto from "crypto";

/**
 * OTP Utility Class
 */
export class OTPUtil {
  /**
   * Generate a random 6-digit OTP
   */
  static generateOTP(): string {
    return crypto.randomInt(100000, 999999).toString();
  }

  /**
   * Generate OTP expiry time (default: 10 minutes)
   */
  static generateOTPExpiry(minutes: number = 10): Date {
    return new Date(Date.now() + minutes * 60 * 1000);
  }

  /**
   * Verify if OTP is expired
   */
  static isOTPExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Hash OTP for secure storage
   */
  static hashOTP(otp: string): string {
    return crypto.createHash("sha256").update(otp).digest("hex");
  }

  /**
   * Verify OTP against hash
   */
  static verifyOTP(otp: string, hashedOTP: string): boolean {
    const inputHash = this.hashOTP(otp);
    return inputHash === hashedOTP;
  }
}
