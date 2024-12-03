import jwt from 'jsonwebtoken';
import { TokenInfo } from '../../types/auth/auth.types';
import { logger } from '../../utils/logger';
import { RedisManager } from '../../utils/redis/RedisManager';
import { TimeUnits } from '../../utils/redis/constants/TimeUnits';

export class TokenService {
  private readonly JWT_SECRET: string;
  private readonly JWT_REFRESH_SECRET: string;
  private readonly JWT_EXPIRES_IN: string;
  private readonly JWT_REFRESH_EXPIRES_IN: string;

  constructor() {
    this.JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
    this.JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'your-refresh-secret-key';
    this.JWT_EXPIRES_IN = '7d';
    this.JWT_REFRESH_EXPIRES_IN = '7d';
  }

  private generateRedisKey(userId: string, tokenType: 'access' | 'refresh'): string {
    return `token:${tokenType}:${userId}`;
  }

  async generateTokens(userId: string): Promise<TokenInfo> {
    try {
      const accessToken = jwt.sign({ userId }, this.JWT_SECRET, {
        expiresIn: this.JWT_EXPIRES_IN,
      });

      const refreshToken = jwt.sign({ userId }, this.JWT_REFRESH_SECRET, {
        expiresIn: this.JWT_REFRESH_EXPIRES_IN,
      });

      // Store tokens in Redis
      const redis = await RedisManager.getInstance();
      
      // Store access token with 7 days expiry
      await redis.setEx(
        this.generateRedisKey(userId, 'access'),
        accessToken,
        7,
        TimeUnits.DAYS
      );

      // Store refresh token with 7 days expiry
      await redis.setEx(
        this.generateRedisKey(userId, 'refresh'),
        refreshToken,
        7,
        TimeUnits.DAYS
      );

      logger.info('Generated new tokens', {
        userId,
        tokenType: 'both',
        expiresIn: this.JWT_EXPIRES_IN
      });

      return {
        accessToken,
        refreshToken,
        expiresIn: 7 * 24 * 3600, // 7 days in seconds
      };
    } catch (error) {
      logger.error('Error generating tokens:', {
        error,
        userId,
        context: 'TokenService.generateTokens'
      });
      throw new Error('Failed to generate tokens');
    }
  }

  async refreshTokens(refreshToken: string): Promise<TokenInfo> {
    try {
      const decoded = jwt.verify(refreshToken, this.JWT_REFRESH_SECRET) as { userId: string };
      
      // Verify refresh token exists in Redis
      const redis = await RedisManager.getInstance();
      const storedToken = await redis.get(this.generateRedisKey(decoded.userId, 'refresh'));
      
      if (!storedToken || storedToken !== refreshToken) {
        throw new Error('Invalid refresh token');
      }

      // Generate new tokens
      return this.generateTokens(decoded.userId);
    } catch (error) {
      logger.error('Error refreshing tokens:', {
        error,
        context: 'TokenService.refreshTokens'
      });
      throw new Error('Invalid refresh token');
    }
  }

  async revokeTokens(userId: string): Promise<void> {
    try {
      const redis = await RedisManager.getInstance();
      
      // Delete both access and refresh tokens
      await redis.del(this.generateRedisKey(userId, 'access'));
      await redis.del(this.generateRedisKey(userId, 'refresh'));

      logger.info('Tokens revoked', {
        userId,
        context: 'TokenService.revokeTokens'
      });
    } catch (error) {
      logger.error('Error revoking tokens:', {
        error,
        userId,
        context: 'TokenService.revokeTokens'
      });
      throw new Error('Failed to revoke tokens');
    }
  }

  async verifyToken(token: string): Promise<{ userId: string }> {
    try {
      const decoded = jwt.verify(token, this.JWT_SECRET) as { userId: string };
      
      if (!decoded || !decoded.userId) {
        throw new Error('Invalid token payload');
      }

      // Verify token exists in Redis
      const redis = await RedisManager.getInstance();
      const storedToken = await redis.get(this.generateRedisKey(decoded.userId, 'access'));
      
      if (!storedToken || storedToken !== token) {
        throw new Error('Token not found in store');
      }

      logger.debug('Token verified successfully', {
        userId: decoded.userId,
        context: 'TokenService.verifyToken'
      });

      return decoded;
    } catch (error) {
      logger.error('Error verifying token:', {
        error,
        context: 'TokenService.verifyToken'
      });
      throw new Error('Invalid token');
    }
  }
}