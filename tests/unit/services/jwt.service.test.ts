import { describe, it, expect, beforeEach } from 'vitest';
import { JWTService } from '../../../services/jwt.service';
import { UserRole } from '../../../types/enums';
import { IJWTPayload } from '../../../types/interfaces';

describe('JWTService', () => {
  const mockPayload: IJWTPayload = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: UserRole.RESTAURANT,
  };

  describe('generateAccessToken', () => {
    it('should generate a valid access token', () => {
      const token = JWTService.generateAccessToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3); // JWT has 3 parts
    });

    it('should include payload data in token', () => {
      const token = JWTService.generateAccessToken(mockPayload);
      const decoded = JWTService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe(mockPayload.id);
      expect(decoded?.email).toBe(mockPayload.email);
      expect(decoded?.role).toBe(mockPayload.role);
    });
  });

  describe('generateRefreshToken', () => {
    it('should generate a valid refresh token', () => {
      const token = JWTService.generateRefreshToken(mockPayload);

      expect(token).toBeDefined();
      expect(typeof token).toBe('string');
      expect(token.split('.')).toHaveLength(3);
    });

    it('should generate different tokens for access and refresh', () => {
      const accessToken = JWTService.generateAccessToken(mockPayload);
      const refreshToken = JWTService.generateRefreshToken(mockPayload);

      expect(accessToken).not.toBe(refreshToken);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      const token = JWTService.generateAccessToken(mockPayload);
      const decoded = JWTService.verifyToken(token);

      expect(decoded).toBeDefined();
      expect(decoded.id).toBe(mockPayload.id);
      expect(decoded.email).toBe(mockPayload.email);
      expect(decoded.role).toBe(mockPayload.role);
    });

    it('should throw error for invalid token', () => {
      expect(() => {
        JWTService.verifyToken('invalid-token');
      }).toThrow();
    });

    it('should throw error for tampered token', () => {
      const token = JWTService.generateAccessToken(mockPayload);
      const tamperedToken = token.slice(0, -5) + 'XXXXX';

      expect(() => {
        JWTService.verifyToken(tamperedToken);
      }).toThrow();
    });
  });

  describe('decodeToken', () => {
    it('should decode token without verification', () => {
      const token = JWTService.generateAccessToken(mockPayload);
      const decoded = JWTService.decodeToken(token);

      expect(decoded).toBeDefined();
      expect(decoded?.id).toBe(mockPayload.id);
    });

    it('should return null for invalid token', () => {
      const decoded = JWTService.decodeToken('invalid-token');
      expect(decoded).toBeNull();
    });
  });

  describe('token expiration', () => {
    it('should include expiration in token', () => {
      const token = JWTService.generateAccessToken(mockPayload);
      const decoded = JWTService.decodeToken(token) as any;

      expect(decoded).toHaveProperty('exp');
      expect(decoded).toHaveProperty('iat');
      expect(decoded.exp).toBeGreaterThan(decoded.iat);
    });
  });
});
