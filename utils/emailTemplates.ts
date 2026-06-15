import { OTPType } from "../types/enums";

/**
 * Email template utility class
 */
export class EmailTemplates {
  /**
   * Get email subject based on OTP type
   */
  static getSubject(otpType: OTPType): string {
    switch (otpType) {
      case OTPType.EMAIL_VERIFICATION:
        return "Verify Your Email - Reality Loops";
      case OTPType.PASSWORD_RESET:
        return "Reset Your Password - Reality Loops";
      case OTPType.LOGIN_VERIFICATION:
        return "Login Verification Code - Reality Loops";
      default:
        return "Verification Code - Reality Loops";
    }
  }

  /**
   * Email verification template
   */
  static emailVerification(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #4CAF50; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .otp-box { background-color: #fff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #4CAF50; border: 2px dashed #4CAF50; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Reality Loops</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>Thank you for registering with Reality Loops!</p>
              <p>Please use the following OTP to verify your email address:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              <p>If you didn't request this verification, please ignore this email.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Reality Loops. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Password reset template
   */
  static passwordReset(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #FF5722; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .otp-box { background-color: #fff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #FF5722; border: 2px dashed #FF5722; margin: 20px 0; }
            .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Password Reset Request</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>We received a request to reset your password.</p>
              <p>Please use the following OTP to reset your password:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              <div class="warning">
                <strong>⚠️ Security Notice:</strong> If you didn't request a password reset, please ignore this email and ensure your account is secure.
              </div>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Reality Loops. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Login verification template
   */
  static loginVerification(name: string, otp: string): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #2196F3; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .otp-box { background-color: #fff; padding: 20px; text-align: center; font-size: 32px; font-weight: bold; color: #2196F3; border: 2px dashed #2196F3; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Login Verification</h1>
            </div>
            <div class="content">
              <h2>Hello ${name},</h2>
              <p>A login attempt was made to your account.</p>
              <p>Please use the following OTP to complete your login:</p>
              <div class="otp-box">${otp}</div>
              <p><strong>This OTP will expire in 10 minutes.</strong></p>
              <p>If this wasn't you, please secure your account immediately.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Reality Loops. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }

  /**
   * Staff account created notification
   */
  static staffAccountCreated(
    staffName: string,
    restaurantName: string,
    email: string,
    tempPassword: string,
    staffRole: string
  ): string {
    return `
      <!DOCTYPE html>
      <html>
        <head>
          <style>
            body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background-color: #9C27B0; color: white; padding: 20px; text-align: center; }
            .content { padding: 30px; background-color: #f9f9f9; }
            .credentials-box { background-color: #fff; padding: 20px; border: 2px solid #9C27B0; margin: 20px 0; }
            .credential-item { margin: 10px 0; padding: 10px; background-color: #f5f5f5; }
            .warning { background-color: #fff3cd; padding: 15px; border-left: 4px solid #ffc107; margin: 20px 0; }
            .footer { text-align: center; padding: 20px; color: #666; font-size: 12px; }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>Welcome to Reality Loops!</h1>
            </div>
            <div class="content">
              <h2>Hello ${staffName},</h2>
              <p>You have been added as a <strong>${staffRole}</strong> member at <strong>${restaurantName}</strong>.</p>
              <p>Your account has been created. Here are your login credentials:</p>
              <div class="credentials-box">
                <div class="credential-item">
                  <strong>Email:</strong> ${email}
                </div>
                <div class="credential-item">
                  <strong>Temporary Password:</strong> ${tempPassword}
                </div>
                <div class="credential-item">
                  <strong>Role:</strong> ${staffRole}
                </div>
              </div>
              <div class="warning">
                <strong>⚠️ Important:</strong> Please change your password after your first login for security reasons.
              </div>
              <p>You can now log in to your account using these credentials.</p>
            </div>
            <div class="footer">
              <p>&copy; ${new Date().getFullYear()} Reality Loops. All rights reserved.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }
}
