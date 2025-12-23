import { beforeAll, afterAll, afterEach, vi } from 'vitest';
import { MongoMemoryServer } from 'mongodb-memory-server';
import mongoose from 'mongoose';
import { config } from 'dotenv';

// Load environment variables for testing
config({ path: '.env.test' });

// Mock email service to prevent actual email sending in tests
vi.mock('../utils/email.service', () => ({
  EmailService: {
    sendOTPEmail: vi.fn().mockResolvedValue(true),
    sendPasswordResetEmail: vi.fn().mockResolvedValue(true),
    sendEmail: vi.fn().mockResolvedValue(true),
  },
}));

let mongoServer: MongoMemoryServer;

/**
 * Connect to in-memory MongoDB before all tests
 */
beforeAll(async () => {
  // Close any existing connections
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  // Create in-memory MongoDB instance
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to in-memory database
  await mongoose.connect(mongoUri);

  console.log('✅ Connected to in-memory MongoDB for testing');
});

/**
 * Clean up database after each test
 */
afterEach(async () => {
  if (mongoose.connection.readyState !== 0) {
    const collections = mongoose.connection.collections;
    for (const key in collections) {
      await collections[key].deleteMany({});
    }
  }
});

/**
 * Disconnect and stop MongoDB after all tests
 */
afterAll(async () => {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }

  if (mongoServer) {
    await mongoServer.stop();
  }

  console.log('✅ Disconnected from in-memory MongoDB');
});

// Set test environment variables
process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test-jwt-secret-key';
process.env.JWT_EXPIRES_IN = '1h';
process.env.REFRESH_TOKEN_EXPIRES_IN = '7d';
