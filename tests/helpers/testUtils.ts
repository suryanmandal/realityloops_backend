import { expect } from 'vitest';
import { Restaurant, Admin, Staff, OTP } from '../../models';
import { UserRole, StaffRole, AccountStatus } from '../../types/enums';
import { JWTService } from '../../services/jwt.service';

/**
 * Test Data Factory
 */
export class TestDataFactory {
  /**
   * Create test restaurant data
   */
  static createRestaurantData(overrides: any = {}) {
    return {
      restaurantName: 'Test Restaurant',
      ownerName: 'Test Owner',
      email: `restaurant${Date.now()}@test.com`,
      phone: '1234567890',
      password: 'Test@123456',
      confirmPassword: 'Test@123456',
      address: '123 Test Street',
      ...overrides,
    };
  }

  /**
   * Create test admin data
   */
  static createAdminData(overrides: any = {}) {
    return {
      name: 'Test Admin',
      email: `admin${Date.now()}@test.com`,
      phone: '9876543210',
      password: 'Admin@123456',
      confirmPassword: 'Admin@123456',
      ...overrides,
    };
  }

  /**
   * Create test staff data
   */
  static createStaffData(overrides: any = {}) {
    return {
      name: 'Test Staff',
      email: `staff${Date.now()}@test.com`,
      staffRole: StaffRole.KITCHEN,
      phone: '5555555555',
      ...overrides,
    };
  }

  /**
   * Create restaurant in database
   */
  static async createRestaurant(overrides: any = {}) {
    const data = {
      restaurantName: 'Test Restaurant',
      ownerName: 'Test Owner',
      email: `restaurant${Date.now()}@test.com`,
      phone: '1234567890',
      password: 'Test@123456',
      role: UserRole.RESTAURANT,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      ...overrides,
    };

    return await Restaurant.create(data);
  }

  /**
   * Create admin in database
   */
  static async createAdmin(overrides: any = {}) {
    const data = {
      name: 'Test Admin',
      email: `admin${Date.now()}@test.com`,
      phone: '9876543210',
      password: 'Admin@123456',
      role: UserRole.ADMIN,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      ...overrides,
    };

    return await Admin.create(data);
  }

  /**
   * Create staff in database
   */
  static async createStaff(restaurantId: string, overrides: any = {}) {
    const data = {
      name: 'Test Staff',
      email: `staff${Date.now()}@test.com`,
      phone: '5555555555',
      password: 'Staff@123456',
      staffRole: StaffRole.KITCHEN,
      restaurantId,
      addedBy: restaurantId,
      role: UserRole.STAFF,
      status: AccountStatus.ACTIVE,
      isEmailVerified: true,
      ...overrides,
    };

    return await Staff.create(data);
  }

  /**
   * Create OTP in database
   */
  static async createOTP(email: string, otpType: string, overrides: any = {}) {
    const data = {
      email,
      otp: '123456',
      otpType,
      expiresAt: new Date(Date.now() + 10 * 60 * 1000), // 10 minutes
      isUsed: false,
      attempts: 0,
      ...overrides,
    };

    return await OTP.create(data);
  }

  /**
   * Generate JWT token for testing
   */
  static generateToken(userId: string, email: string, role: UserRole) {
    return JWTService.generateAccessToken({
      id: userId,
      email,
      role,
    });
  }
}

/**
 * Mock email service for testing
 */
export class MockEmailService {
  static sentEmails: Array<{
    to: string;
    subject: string;
    html: string;
  }> = [];

  static reset() {
    this.sentEmails = [];
  }

  static async sendEmail(to: string, subject: string, html: string) {
    this.sentEmails.push({ to, subject, html });
    return true;
  }

  static getLastEmail() {
    return this.sentEmails[this.sentEmails.length - 1];
  }

  static getAllEmails() {
    return this.sentEmails;
  }
}

/**
 * Test assertions helpers
 */
export class TestAssertions {
  static assertValidJWT(token: string) {
    expect(token).toBeDefined();
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  }

  static assertValidEmail(email: string) {
    expect(email).toMatch(/^[^\s@]+@[^\s@]+\.[^\s@]+$/);
  }

  static assertValidOTP(otp: string) {
    expect(otp).toMatch(/^\d{6}$/);
  }

  static assertSuccessResponse(response: any) {
    expect(response.body).toHaveProperty('success', true);
    expect(response.body).toHaveProperty('message');
  }

  static assertErrorResponse(response: any, message?: string) {
    expect(response.body).toHaveProperty('success', false);
    expect(response.body).toHaveProperty('message');
    if (message) {
      expect(response.body.message).toContain(message);
    }
  }
}
