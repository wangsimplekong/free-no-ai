import { RedisService } from './RedisService';
import redisConfig from '../../config/redis.config';
import { logger } from '../logger';

export class RedisManager {
  private static instance: RedisService | null = null;

  static async getInstance(): Promise<RedisService> {
    if (!RedisManager.instance) {
      RedisManager.instance = new RedisService(redisConfig);
      await RedisManager.instance.initialize();
    }
    return RedisManager.instance;
  }

  static async closeConnection(): Promise<void> {
    if (RedisManager.instance) {
      logger.info('Closing Redis connection');
      RedisManager.instance = null;
    }
  }
}