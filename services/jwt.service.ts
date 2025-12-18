import jwt, { SignOptions } from "jsonwebtoken";
import { IJWTPayload } from "../types/interfaces";
import { logger } from "../utils/logger";

/**
 * JWT Service Class
 */
export class JWTService {
  private static readonly JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
  private static readonly JWT_EXPIRES_IN: string | number = process.env.JWT_EXPIRES_IN || "7d";
  private static readonly REFRESH_TOKEN_EXPIRES_IN: string | number = process.env.REFRESH_TOKEN_EXPIRES_IN || "30d";

  /**
   * Generate access token
   */
  static generateAccessToken(payload: IJWTPayload): string {
    try {
      const options: SignOptions = {
        expiresIn: this.JWT_EXPIRES_IN as any,
      };
      return jwt.sign(payload, this.JWT_SECRET, options);
    } catch (error: any) {
      logger.error("Error generating access token", { error: error.message });
      throw new Error("Token generation failed");
    }
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(payload: IJWTPayload): string {
    try {
      const options: SignOptions = {
        expiresIn: this.REFRESH_TOKEN_EXPIRES_IN as any,
      };
      return jwt.sign(payload, this.JWT_SECRET, options);
    } catch (error: any) {
      logger.error("Error generating refresh token", { error: error.message });
      throw new Error("Token generation failed");
    }
  }

  /**
   * Verify token
   */
  static verifyToken(token: string): IJWTPayload {
    try {
      return jwt.verify(token, this.JWT_SECRET) as IJWTPayload;
    } catch (error: any) {
      logger.error("Error verifying token", { error: error.message });
      throw new Error("Invalid or expired token");
    }
  }

  /**
   * Decode token without verification (useful for debugging)
   */
  static decodeToken(token: string): IJWTPayload | null {
    try {
      return jwt.decode(token) as IJWTPayload;
    } catch (error: any) {
      logger.error("Error decoding token", { error: error.message });
      return null;
    }
  }
}
