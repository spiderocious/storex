/* eslint-disable @typescript-eslint/no-explicit-any */
import jwt from 'jsonwebtoken';
import { configs } from '@/configs';
import { IUser } from '@/models/User';
import { logger } from '@/utils/logger';

// JWT Payload interface
export interface JWTPayload {
  userId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Token pair interface
export interface TokenPair {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

const token_issuer = 'api';
const token_audience = 'app';

const tokenOptions = {
  issuer: token_issuer,
  audience: token_audience,
};

/**
 * JWT Utility Class
 */
export class JWTUtils {
  /**
   * Generate access token
   */
  static generateAccessToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, configs.jwt.secret, {
      expiresIn: configs.jwt.expire,
      ...tokenOptions,
    } as any);
  }

  /**
   * Generate refresh token
   */
  static generateRefreshToken(user: IUser): string {
    const payload: JWTPayload = {
      userId: user.id,
      email: user.email,
    };

    return jwt.sign(payload, configs.jwt.secret, {
      expiresIn: configs.jwt.refreshExpire,
      ...tokenOptions,
    } as any);
  }

  /**
   * Generate token pair (access + refresh)
   */
  static generateTokenPair(user: IUser): TokenPair {
    const accessToken = this.generateAccessToken(user);
    const refreshToken = this.generateRefreshToken(user);

    return {
      accessToken,
      refreshToken,
      expiresIn: configs.jwt.expire,
    };
  }

  /**
   * Verify access token
   */
  static verifyAccessToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, configs.jwt.secret, {
        ...tokenOptions,
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      logger.warn('Invalid access token:', { error: (error as Error).message });
      throw new Error('Invalid or expired token');
    }
  }

  /**
   * Verify refresh token
   */
  static verifyRefreshToken(token: string): JWTPayload {
    try {
      const decoded = jwt.verify(token, configs.jwt.secret, {
        ...tokenOptions,
      }) as JWTPayload;

      return decoded;
    } catch (error) {
      logger.warn('Invalid refresh token:', { error: (error as Error).message });
      throw new Error('Invalid or expired refresh token');
    }
  }

  /**
   * Extract token from Authorization header
   */
  static extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) return null;

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== 'Bearer') {
      return null;
    }

    return parts[1] ?? null;
  }

  /**
   * Get token expiration date
   */
  static getTokenExpiration(token: string): Date | null {
    try {
      const decoded = jwt.decode(token) as any;
      if (!decoded || !decoded.exp) return null;

      return new Date(decoded.exp * 1000);
    } catch (error) {
      return null;
    }
  }

  /**
   * Check if token is expired
   */
  static isTokenExpired(token: string): boolean {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return true;

    return expiration.getTime() < Date.now();
  }

  /**
   * Get time until token expires (in seconds)
   */
  static getTimeUntilExpiry(token: string): number | null {
    const expiration = this.getTokenExpiration(token);
    if (!expiration) return null;

    const timeUntilExpiry = Math.floor((expiration.getTime() - Date.now()) / 1000);
    return timeUntilExpiry > 0 ? timeUntilExpiry : 0;
  }

  /**
   * Decode token without verification (for debugging)
   */
  static decodeToken(token: string): any {
    try {
      return jwt.decode(token);
    } catch (error) {
      return null;
    }
  }
}

/**
 * Generate secure random token for password reset, etc.
 */
export const generateSecureToken = (): string => {
  const crypto = require('crypto');
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Hash password reset token
 */
export const hashToken = (token: string): string => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(token).digest('hex');
};

/**
 * Verify password reset token
 */
export const verifyPasswordResetToken = (token: string, hashedToken: string): boolean => {
  const hashedInput = hashToken(token);
  return hashedInput === hashedToken;
};
