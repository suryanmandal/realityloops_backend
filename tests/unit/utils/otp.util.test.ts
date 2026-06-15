import { describe, it, expect } from 'vitest';
import { OTPUtil } from '../../../utils/otp.util';

describe('OTPUtil', () => {
  describe('generateOTP', () => {
    it('should generate a 6-digit OTP', () => {
      const otp = OTPUtil.generateOTP();
      expect(otp).toMatch(/^\d{6}$/);
    });

    it('should generate different OTPs on each call', () => {
      const otp1 = OTPUtil.generateOTP();
      const otp2 = OTPUtil.generateOTP();
      const otp3 = OTPUtil.generateOTP();

      // High probability all are different
      const uniqueOTPs = new Set([otp1, otp2, otp3]);
      expect(uniqueOTPs.size).toBeGreaterThanOrEqual(2);
    });

    it('should generate OTP with leading zeros if needed', () => {
      // Generate multiple OTPs to increase chance of getting one with leading zero
      const otps = Array.from({ length: 100 }, () => OTPUtil.generateOTP());

      // All should be exactly 6 digits
      otps.forEach(otp => {
        expect(otp.length).toBe(6);
        expect(otp).toMatch(/^\d{6}$/);
      });
    });

    it('should generate numeric string, not number', () => {
      const otp = OTPUtil.generateOTP();
      expect(typeof otp).toBe('string');
    });
  });

  describe('generateOTPExpiry', () => {
    it('should generate expiry time in the future', () => {
      const minutes = 10;
      const expiryDate = OTPUtil.generateOTPExpiry(minutes);
      const now = new Date();

      expect(expiryDate.getTime()).toBeGreaterThan(now.getTime());
    });

    it('should generate expiry time with correct duration', () => {
      const minutes = 10;
      const expiryDate = OTPUtil.generateOTPExpiry(minutes);
      const now = new Date();

      const expectedExpiry = new Date(now.getTime() + minutes * 60 * 1000);
      const difference = Math.abs(expiryDate.getTime() - expectedExpiry.getTime());

      // Allow 1 second tolerance for test execution time
      expect(difference).toBeLessThan(1000);
    });

    it('should handle different minute values', () => {
      const now = new Date();

      const expiry5 = OTPUtil.generateOTPExpiry(5);
      const expiry15 = OTPUtil.generateOTPExpiry(15);
      const expiry30 = OTPUtil.generateOTPExpiry(30);

      expect(expiry5.getTime()).toBeLessThan(expiry15.getTime());
      expect(expiry15.getTime()).toBeLessThan(expiry30.getTime());
    });

    it('should return Date object', () => {
      const expiryDate = OTPUtil.generateOTPExpiry(10);
      expect(expiryDate).toBeInstanceOf(Date);
    });
  });

  describe('isOTPExpired', () => {
    it('should return false for future dates', () => {
      const futureDate = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes in future
      expect(OTPUtil.isOTPExpired(futureDate)).toBe(false);
    });

    it('should return true for past dates', () => {
      const pastDate = new Date(Date.now() - 10 * 60 * 1000); // 10 minutes ago
      expect(OTPUtil.isOTPExpired(pastDate)).toBe(true);
    });

    it('should return false for exact current time (boundary case)', () => {
      const now = new Date();
      // Exact current time is not expired (using strict >)
      expect(OTPUtil.isOTPExpired(now)).toBe(false);
    });

    it('should handle dates far in the past', () => {
      const veryOld = new Date('2020-01-01');
      expect(OTPUtil.isOTPExpired(veryOld)).toBe(true);
    });

    it('should handle dates far in the future', () => {
      const veryFuture = new Date('2030-12-31');
      expect(OTPUtil.isOTPExpired(veryFuture)).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should create expired OTP that can be detected', () => {
      const minutes = -5; // Negative minutes for past
      const expiredDate = OTPUtil.generateOTPExpiry(minutes);

      expect(OTPUtil.isOTPExpired(expiredDate)).toBe(true);
    });

    it('should create valid OTP that is not expired', () => {
      const minutes = 10;
      const validDate = OTPUtil.generateOTPExpiry(minutes);

      expect(OTPUtil.isOTPExpired(validDate)).toBe(false);
    });

    it('should generate OTP and expiry together', () => {
      const otp = OTPUtil.generateOTP();
      const expiry = OTPUtil.generateOTPExpiry(10);

      expect(otp).toMatch(/^\d{6}$/);
      expect(expiry).toBeInstanceOf(Date);
      expect(OTPUtil.isOTPExpired(expiry)).toBe(false);
    });
  });
});
