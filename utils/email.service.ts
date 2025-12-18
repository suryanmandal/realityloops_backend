import { mailTransporter } from "../config/mailConfig";
import { logger } from "./logger";
import { OTPType } from "../types/enums";
import { EmailTemplates } from "./emailTemplates";

/**
 * Email Service Class
 */
export class EmailService {
  /**
   * Send email
   */
  static async sendEmail(
    to: string,
    subject: string,
    html: string
  ): Promise<boolean> {
    try {
      await mailTransporter.sendMail({
        from: `"Reality Loops" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        html,
      });

      logger.info(`Email sent successfully to ${to}`);
      return true;
    } catch (error: any) {
      logger.error(`Failed to send email to ${to}`, { error: error.message });
      return false;
    }
  }

  /**
   * Send OTP email
   */
  static async sendOTPEmail(
    to: string,
    name: string,
    otp: string,
    otpType: OTPType
  ): Promise<boolean> {
    const subject = EmailTemplates.getSubject(otpType);
    let html = "";

    switch (otpType) {
      case OTPType.EMAIL_VERIFICATION:
        html = EmailTemplates.emailVerification(name, otp);
        break;
      case OTPType.PASSWORD_RESET:
        html = EmailTemplates.passwordReset(name, otp);
        break;
      case OTPType.LOGIN_VERIFICATION:
        html = EmailTemplates.loginVerification(name, otp);
        break;
      default:
        html = EmailTemplates.emailVerification(name, otp);
    }

    return await this.sendEmail(to, subject, html);
  }

  /**
   * Send staff account created email
   */
  static async sendStaffAccountEmail(
    to: string,
    staffName: string,
    restaurantName: string,
    tempPassword: string,
    staffRole: string
  ): Promise<boolean> {
    const subject = "Your Staff Account Has Been Created - Reality Loops";
    const html = EmailTemplates.staffAccountCreated(
      staffName,
      restaurantName,
      to,
      tempPassword,
      staffRole
    );

    return await this.sendEmail(to, subject, html);
  }
}
