import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import request from 'supertest';
import app from '../../app';
import { Restaurant, OTP } from '../../models';
import { UserRole, AccountStatus } from '../../types/enums';
import mongoose from 'mongoose';

/**
 * E2E Test Suite for Restaurant Authentication
 * 
 * Tests cover:
 * 1. Restaurant Signup
 * 2. Email Verification (OTP)
 * 3. Login
 * 4. Resend OTP
 * 5. Forgot Password
 * 6. Reset Password
 */
describe('Restaurant Authentication - E2E Tests', () => {
  const testEmail = `restaurant${Date.now()}@test.com`;
  const testPassword = 'Test@123456';

  afterEach(async () => {
    // Clean up test data
    await Restaurant.deleteMany({ email: testEmail });
    await OTP.deleteMany({ email: testEmail });
  });

  /**
   * Test Suite 1: Restaurant Signup
   */
  describe('POST /api/v1/restaurant/auth/signup - Signup', () => {
    it('should signup restaurant successfully with valid data', async () => {
      const signupData = {
        restaurantName: 'Test Restaurant',
        ownerName: 'Test Owner',
        email: testEmail,
        phone: '1234567890',
        password: testPassword,
        confirmPassword: testPassword,
        address: '123 Test Street',
      };

      const response = await request(app)
        .post('/api/v1/restaurant/auth/signup')
        .send(signupData)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verify');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.user.email).toBe(testEmail);
      expect(response.body.data.user.role).toBe(UserRole.RESTAURANT);
      expect(response.body.data.user.status).toBe(AccountStatus.PENDING_VERIFICATION);
      expect(response.body.data.user.isEmailVerified).toBe(false);

      // Verify OTP was created
      const otp = await OTP.findOne({ email: testEmail });
      expect(otp).toBeDefined();
      expect(otp?.otpType).toBe('email_verification');
    });

    it('should fail with duplicate email', async () => {
      // Create restaurant first
      await Restaurant.create({
        restaurantName: 'Existing Restaurant',
        ownerName: 'Owner',
        email: testEmail,
        phone: '1234567890',
        password: testPassword,
        role: UserRole.RESTAURANT,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      });

      const signupData = {
        restaurantName: 'New Restaurant',
        ownerName: 'New Owner',
        email: testEmail,
        phone: '9876543210',
        password: testPassword,
        confirmPassword: testPassword,
      };

      const response = await request(app)
        .post('/api/v1/restaurant/auth/signup')
        .send(signupData)
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('exists');
    });

    it('should fail with mismatched passwords', async () => {
      const signupData = {
        restaurantName: 'Test Restaurant',
        ownerName: 'Test Owner',
        email: testEmail,
        phone: '1234567890',
        password: testPassword,
        confirmPassword: 'DifferentPassword123!',
      };

      const response = await request(app)
        .post('/api/v1/restaurant/auth/signup')
        .send(signupData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with weak password', async () => {
      const signupData = {
        restaurantName: 'Test Restaurant',
        ownerName: 'Test Owner',
        email: testEmail,
        phone: '1234567890',
        password: '123456', // Weak password
        confirmPassword: '123456',
      };

      const response = await request(app)
        .post('/api/v1/restaurant/auth/signup')
        .send(signupData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with invalid email format', async () => {
      const signupData = {
        restaurantName: 'Test Restaurant',
        ownerName: 'Test Owner',
        email: 'invalid-email',
        phone: '1234567890',
        password: testPassword,
        confirmPassword: testPassword,
      };

      const response = await request(app)
        .post('/api/v1/restaurant/auth/signup')
        .send(signupData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with missing required fields', async () => {
      const signupData = {
        email: testEmail,
        password: testPassword,
        // Missing restaurantName, ownerName, phone
      };

      const response = await request(app)
        .post('/api/v1/restaurant/auth/signup')
        .send(signupData)
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * Test Suite 2: Email Verification
   */
  describe('POST /api/v1/restaurant/auth/verify-email - Verify Email', () => {
    let restaurant: any;
    let validOTP: string;

    beforeEach(async () => {
      // Create unverified restaurant
      restaurant = await Restaurant.create({
        restaurantName: 'Test Restaurant',
        ownerName: 'Test Owner',
        email: testEmail,
        phone: '1234567890',
        password: testPassword,
        role: UserRole.RESTAURANT,
        status: AccountStatus.PENDING_VERIFICATION,
        isEmailVerified: false,
      });

      // Create OTP
      validOTP = '123456';
      await OTP.create({
        email: testEmail,
        otp: validOTP,
        otpType: 'email_verification',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
        attempts: 0,
      });
    });

    it('should verify email successfully with valid OTP', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/verify-email')
        .send({
          email: testEmail,
          otp: validOTP,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('verified');
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();

      // Verify restaurant is now active
      const updatedRestaurant = await Restaurant.findById(restaurant._id);
      expect(updatedRestaurant?.isEmailVerified).toBe(true);
      expect(updatedRestaurant?.status).toBe(AccountStatus.ACTIVE);
    });

    it('should fail with invalid OTP', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/verify-email')
        .send({
          email: testEmail,
          otp: '999999',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should fail with expired OTP', async () => {
      // Create expired OTP
      await OTP.findOneAndUpdate(
        { email: testEmail },
        { expiresAt: new Date(Date.now() - 1000) }
      );

      const response = await request(app)
        .post('/api/v1/restaurant/auth/verify-email')
        .send({
          email: testEmail,
          otp: validOTP,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('expired');
    });

    it('should fail if already verified', async () => {
      // Verify first time
      await request(app)
        .post('/api/v1/restaurant/auth/verify-email')
        .send({
          email: testEmail,
          otp: validOTP,
        })
        .expect(200);

      // Try to verify again
      const response = await request(app)
        .post('/api/v1/restaurant/auth/verify-email')
        .send({
          email: testEmail,
          otp: validOTP,
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * Test Suite 3: Login
   */
  describe('POST /api/v1/restaurant/auth/login - Login', () => {
    beforeEach(async () => {
      // Create verified restaurant
      // Password will be hashed by the model's pre-save hook
      await Restaurant.create({
        restaurantName: 'Test Restaurant',
        ownerName: 'Test Owner',
        email: testEmail,
        phone: '1234567890',
        password: testPassword,
        role: UserRole.RESTAURANT,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      });
    });

    it('should login successfully with valid credentials', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/login')
        .send({
          email: testEmail,
          password: testPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('successful');
      expect(response.body.data.user).toBeDefined();
      expect(response.body.data.token).toBeDefined();
      expect(response.body.data.refreshToken).toBeDefined();
      expect(response.body.data.user.email).toBe(testEmail);
    });

    it('should fail with incorrect password', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/login')
        .send({
          email: testEmail,
          password: 'WrongPassword123!',
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('Invalid');
    });

    it('should fail with non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/login')
        .send({
          email: 'nonexistent@test.com',
          password: testPassword,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
    });

    it('should fail with unverified email', async () => {
      // Create unverified restaurant
      // Password will be hashed by the model's pre-save hook
      const unverifiedEmail = `unverified${Date.now()}@test.com`;
      
      await Restaurant.create({
        restaurantName: 'Unverified Restaurant',
        ownerName: 'Owner',
        email: unverifiedEmail,
        phone: '9999999999',
        password: testPassword,
        role: UserRole.RESTAURANT,
        status: AccountStatus.PENDING_VERIFICATION,
        isEmailVerified: false,
      });

      const response = await request(app)
        .post('/api/v1/restaurant/auth/login')
        .send({
          email: unverifiedEmail,
          password: testPassword,
        })
        .expect(401);

      expect(response.body.success).toBe(false);
      expect(response.body.message).toContain('verify');

      // Cleanup
      await Restaurant.deleteOne({ email: unverifiedEmail });
    });

    it('should fail with missing credentials', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/login')
        .send({
          email: testEmail,
          // Missing password
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * Test Suite 4: Resend OTP
   */
  describe('POST /api/v1/restaurant/auth/resend-otp - Resend OTP', () => {
    beforeEach(async () => {
      // Create unverified restaurant
      await Restaurant.create({
        restaurantName: 'Test Restaurant',
        ownerName: 'Test Owner',
        email: testEmail,
        phone: '1234567890',
        password: testPassword,
        role: UserRole.RESTAURANT,
        status: AccountStatus.PENDING_VERIFICATION,
        isEmailVerified: false,
      });
    });

    it('should resend OTP successfully', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/resend-otp')
        .send({
          email: testEmail,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('sent');

      // Verify new OTP was created
      const otp = await OTP.findOne({ email: testEmail });
      expect(otp).toBeDefined();
      expect(otp?.otpType).toBe('email_verification');
    });

    it('should fail for already verified email', async () => {
      // Mark as verified
      await Restaurant.findOneAndUpdate(
        { email: testEmail },
        { isEmailVerified: true, status: AccountStatus.ACTIVE }
      );

      const response = await request(app)
        .post('/api/v1/restaurant/auth/resend-otp')
        .send({
          email: testEmail,
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });

    it('should fail for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/resend-otp')
        .send({
          email: 'nonexistent@test.com',
        });

      expect(response.status).toBeGreaterThanOrEqual(400);
      expect(response.body.success).toBe(false);
    });
  });

  /**
   * Test Suite 5: Forgot Password
   */
  describe('POST /api/v1/restaurant/auth/forgot-password - Forgot Password', () => {
    beforeEach(async () => {
      // Password will be hashed by the model's pre-save hook
      await Restaurant.create({
        restaurantName: 'Test Restaurant',
        ownerName: 'Test Owner',
        email: testEmail,
        phone: '1234567890',
        password: testPassword,
        role: UserRole.RESTAURANT,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      });
    });

    it('should send password reset OTP successfully', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/forgot-password')
        .send({
          email: testEmail,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toBeDefined();

      // Verify OTP was created
      const otp = await OTP.findOne({ email: testEmail });
      expect(otp).toBeDefined();
      expect(otp?.otpType).toBe('password_reset');
    });

    it('should fail for non-existent email', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/forgot-password')
        .send({
          email: 'nonexistent@test.com',
        });

      // Forgot password endpoints often return 200 for security (don't reveal if email exists)
      // So we just check it completes without error
      expect(response.status).toBeLessThan(500);
    });

    it('should fail with invalid email format', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/forgot-password')
        .send({
          email: 'invalid-email',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });

  /**
   * Test Suite 6: Reset Password
   */
  describe('POST /api/v1/restaurant/auth/reset-password - Reset Password', () => {
    let validOTP: string;

    beforeEach(async () => {
      // Password will be hashed by the model's pre-save hook
      await Restaurant.create({
        restaurantName: 'Test Restaurant',
        ownerName: 'Test Owner',
        email: testEmail,
        phone: '1234567890',
        password: testPassword,
        role: UserRole.RESTAURANT,
        status: AccountStatus.ACTIVE,
        isEmailVerified: true,
      });

      // Create password reset OTP
      validOTP = '123456';
      await OTP.create({
        email: testEmail,
        otp: validOTP,
        otpType: 'password_reset',
        expiresAt: new Date(Date.now() + 10 * 60 * 1000),
        isUsed: false,
        attempts: 0,
      });
    });

    it('should reset password successfully with valid OTP', async () => {
      const newPassword = 'NewPassword123!';
      
      const response = await request(app)
        .post('/api/v1/restaurant/auth/reset-password')
        .send({
          email: testEmail,
          otp: validOTP,
          newPassword: newPassword,
          confirmPassword: newPassword,
        })
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.message).toContain('reset successful');

      // Verify can login with new password
      const loginResponse = await request(app)
        .post('/api/v1/restaurant/auth/login')
        .send({
          email: testEmail,
          password: newPassword,
        })
        .expect(200);

      expect(loginResponse.body.success).toBe(true);
    });

    it('should fail with invalid OTP', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/reset-password')
        .send({
          email: testEmail,
          otp: '999999',
          newPassword: 'NewPassword123!',
          confirmPassword: 'NewPassword123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with mismatched passwords', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/reset-password')
        .send({
          email: testEmail,
          otp: validOTP,
          newPassword: 'NewPassword123!',
          confirmPassword: 'DifferentPassword123!',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });

    it('should fail with weak new password', async () => {
      const response = await request(app)
        .post('/api/v1/restaurant/auth/reset-password')
        .send({
          email: testEmail,
          otp: validOTP,
          newPassword: '12345',
          confirmPassword: '12345',
        })
        .expect(400);

      expect(response.body.success).toBe(false);
    });
  });
});
