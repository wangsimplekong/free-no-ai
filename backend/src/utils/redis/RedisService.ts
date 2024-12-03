import { Redis } from '@upstash/redis';
import { TimeUnits, convertToSeconds } from './constants/TimeUnits';
import { logger } from '../logger';

export class RedisService {
  private client: Redis;

  constructor(config: { url: string; token: string }) {
    this.client = new Redis({
      url: config.url,
      token: config.token,
    });
  }

  async initialize(): Promise<void> {
    try {
      logger.info('Initializing Redis connection', {
        context: 'RedisService',
        timestamp: new Date().toISOString()
      });

      await this.client.ping();

      logger.info('Redis connection established successfully', {
        context: 'RedisService',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      logger.error('Redis connection failed', {
        context: 'RedisService',
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async set(key: string, value: any, expire: number | null = null): Promise<string | null> {
    return this.setEx(key, value, expire, TimeUnits.SECONDS);
  }

  async setEx(key: string, value: any, expire: number | null = null, unit: TimeUnits = TimeUnits.SECONDS): Promise<string | null> {
    try {
      logger.debug('Setting Redis key with expiration', {
        context: 'RedisService',
        key,
        expire,
        unit,
        timestamp: new Date().toISOString()
      });

      let result;
      if (expire !== null) {
        const seconds = convertToSeconds(expire, unit);
        result = await this.client.set(key, value, { ex: seconds });
      } else {
        result = await this.client.set(key, value);
      }

      logger.debug('Redis key set successfully', {
        context: 'RedisService',
        key,
        expire,
        unit,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      logger.error('Failed to set Redis key', {
        context: 'RedisService',
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async get<T = any>(key: string): Promise<T | null> {
    try {
      logger.debug('Getting Redis key', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      const result = await this.client.get<T>(key);

      logger.debug('Redis key retrieved successfully', {
        context: 'RedisService',
        key,
        found: result !== null,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      logger.error('Failed to get Redis key', {
        context: 'RedisService',
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async del(key: string): Promise<number> {
    try {
      logger.debug('Deleting Redis key', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      const result = await this.client.del(key);

      logger.debug('Redis key deleted successfully', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      logger.error('Failed to delete Redis key', {
        context: 'RedisService',
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async exists(key: string): Promise<number> {
    try {
      logger.debug('Checking Redis key existence', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      const result = await this.client.exists(key);

      logger.debug('Redis key existence checked', {
        context: 'RedisService',
        key,
        exists: result === 1,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      logger.error('Failed to check Redis key existence', {
        context: 'RedisService',
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }

  async ttl(key: string): Promise<number> {
    try {
      logger.debug('Getting Redis key TTL', {
        context: 'RedisService',
        key,
        timestamp: new Date().toISOString()
      });

      const result = await this.client.ttl(key);

      logger.debug('Redis key TTL retrieved', {
        context: 'RedisService',
        key,
        ttl: result,
        timestamp: new Date().toISOString()
      });

      return result;
    } catch (error) {
      logger.error('Failed to get Redis key TTL', {
        context: 'RedisService',
        key,
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        timestamp: new Date().toISOString()
      });
      throw error;
    }
  }
}