import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { OTPService } from '../../../services/otp.service';
import OTP from '../../../models/otp';
import { OTPType } from '../../../types/enums';
import { EmailService } from '../../../utils/email.service';
import { OTPUtil } from '../../../utils/otp.util';

// Mock EmailService
vi.mock('../../../utils/email.service', () => ({
  EmailService: {
    sendOTPEmail: vi.fn(),
  },
}));

describe('OTPService', () => {
  const mockEmail = 'test@example.com';
  const mockName = 'Test User';

  beforeEach(async () => {
    // Clear all OTPs before each test
    await OTP.deleteMany({});
    vi.clearAllMocks();

    // Mock successful email sending by default
    vi.mocked(EmailService.sendOTPEmail).mockResolvedValue(true);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('generateAndSendOTP', () => {
    it('should generate and send OTP successfully', async () => {
      const result = await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('OTP sent successfully');

      // Verify OTP is saved in database
      const savedOTP = await OTP.findOne({ email: mockEmail });
      expect(savedOTP).toBeDefined();
      expect(savedOTP?.email).toBe(mockEmail);
      expect(savedOTP?.otpType).toBe(OTPType.EMAIL_VERIFICATION);
      expect(savedOTP?.isUsed).toBe(false);
      expect(savedOTP?.attempts).toBe(0);

      // Verify email was sent
      expect(EmailService.sendOTPEmail).toHaveBeenCalledWith(
        mockEmail,
        mockName,
        expect.any(String),
        OTPType.EMAIL_VERIFICATION
      );
    });

    it('should generate a 6-digit OTP', async () => {
      const result = await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(true);

      const savedOTP = await OTP.findOne({ email: mockEmail });
      expect(savedOTP?.otp).toMatch(/^\d{6}$/); // 6 digits
    });

    it('should set expiration time', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      const savedOTP = await OTP.findOne({ email: mockEmail });
      const now = new Date();
      const expiresAt = savedOTP?.expiresAt;

      expect(expiresAt).toBeDefined();
      expect(expiresAt!.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should delete existing unused OTPs before creating new one', async () => {
      // Create first OTP
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      const firstOTP = await OTP.findOne({ email: mockEmail });
      const firstOTPCode = firstOTP?.otp;

      // Create second OTP
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      // Should only have one OTP
      const otpCount = await OTP.countDocuments({
        email: mockEmail,
        otpType: OTPType.EMAIL_VERIFICATION,
        isUsed: false
      });
      expect(otpCount).toBe(1);

      // The new OTP should be different
      const secondOTP = await OTP.findOne({ email: mockEmail });
      expect(secondOTP?.otp).not.toBe(firstOTPCode);
    });

    it('should allow different OTP types for the same email', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.PASSWORD_RESET
      );

      const otpCount = await OTP.countDocuments({ email: mockEmail });
      expect(otpCount).toBe(2);
    });

    it('should handle email sending failure', async () => {
      // Mock email sending failure
      vi.mocked(EmailService.sendOTPEmail).mockResolvedValue(false);

      const result = await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to send OTP email');
    });

    it('should handle errors gracefully', async () => {
      // Mock database error
      vi.mocked(EmailService.sendOTPEmail).mockRejectedValue(
        new Error('Email service error')
      );

      const result = await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Failed to generate OTP');
    });
  });

  describe('verifyOTP', () => {
    it('should verify valid OTP', async () => {
      // Generate OTP
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      const savedOTP = await OTP.findOne({ email: mockEmail });
      const otpCode = savedOTP?.otp!;

      // Verify OTP
      const result = await OTPService.verifyOTP(
        mockEmail,
        otpCode,
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(true);
      expect(result.message).toContain('verified successfully');

      // OTP should be marked as used
      const usedOTP = await OTP.findOne({ email: mockEmail });
      expect(usedOTP?.isUsed).toBe(true);
    });

    it('should reject invalid OTP', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      const result = await OTPService.verifyOTP(
        mockEmail,
        '000000',
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid OTP');
    });

    it('should reject expired OTP', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      // Manually expire the OTP
      await OTP.updateOne(
        { email: mockEmail },
        { expiresAt: new Date(Date.now() - 1000) }
      );

      const savedOTP = await OTP.findOne({ email: mockEmail });
      const otpCode = savedOTP?.otp!;

      const result = await OTPService.verifyOTP(
        mockEmail,
        otpCode,
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('expired');
    });

    it('should reject OTP for wrong type', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      const savedOTP = await OTP.findOne({ email: mockEmail });
      const otpCode = savedOTP?.otp!;

      const result = await OTPService.verifyOTP(
        mockEmail,
        otpCode,
        OTPType.PASSWORD_RESET
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid OTP');
    });

    it('should increment attempts on invalid OTP', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      // Try invalid OTP
      await OTPService.verifyOTP(
        mockEmail,
        '000000',
        OTPType.EMAIL_VERIFICATION
      );

      const savedOTP = await OTP.findOne({ email: mockEmail });
      expect(savedOTP?.attempts).toBe(1);
    });

    it('should reject OTP after max attempts', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      // Set attempts to max
      await OTP.updateOne(
        { email: mockEmail },
        { attempts: 5 }
      );

      const savedOTP = await OTP.findOne({ email: mockEmail });
      const otpCode = savedOTP?.otp!;

      const result = await OTPService.verifyOTP(
        mockEmail,
        otpCode,
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Too many failed attempts');
    });

    it('should return error when OTP not found', async () => {
      const result = await OTPService.verifyOTP(
        mockEmail,
        '123456',
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid OTP');
    });

    it('should not verify already used OTP', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      const savedOTP = await OTP.findOne({ email: mockEmail });
      const otpCode = savedOTP?.otp!;

      // Use OTP first time
      await OTPService.verifyOTP(
        mockEmail,
        otpCode,
        OTPType.EMAIL_VERIFICATION
      );

      // Try to use again
      const result = await OTPService.verifyOTP(
        mockEmail,
        otpCode,
        OTPType.EMAIL_VERIFICATION
      );

      expect(result.success).toBe(false);
      expect(result.message).toContain('Invalid OTP');
    });
  });

  describe('deleteOTPs', () => {
    it('should delete OTPs for specific type', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      await OTPService.deleteOTPs(mockEmail, OTPType.EMAIL_VERIFICATION);

      const savedOTP = await OTP.findOne({
        email: mockEmail,
        otpType: OTPType.EMAIL_VERIFICATION
      });
      expect(savedOTP).toBeNull();
    });

    it('should delete all OTPs if type not specified', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.PASSWORD_RESET
      );

      await OTPService.deleteOTPs(mockEmail);

      const otpCount = await OTP.countDocuments({ email: mockEmail });
      expect(otpCount).toBe(0);
    });

    it('should not delete OTPs of different types when type specified', async () => {
      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.EMAIL_VERIFICATION
      );

      await OTPService.generateAndSendOTP(
        mockEmail,
        mockName,
        OTPType.PASSWORD_RESET
      );

      await OTPService.deleteOTPs(mockEmail, OTPType.EMAIL_VERIFICATION);

      const emailVerificationOTP = await OTP.findOne({
        email: mockEmail,
        otpType: OTPType.EMAIL_VERIFICATION
      });
      const passwordResetOTP = await OTP.findOne({
        email: mockEmail,
        otpType: OTPType.PASSWORD_RESET
      });

      expect(emailVerificationOTP).toBeNull();
      expect(passwordResetOTP).toBeDefined();
    });

    it('should handle deletion of non-existent OTPs gracefully', async () => {
      // Should not throw error
      await expect(
        OTPService.deleteOTPs(mockEmail, OTPType.EMAIL_VERIFICATION)
      ).resolves.toBeUndefined();
    });
  });
});

