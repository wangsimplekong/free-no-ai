import dotenv from 'dotenv';
import { logger } from '../utils/logger';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

interface RedisConfig {
  url: string;
  token: string;
}

const redisConfig: Record<string, RedisConfig> = {
  development: {
    url: process.env.REDIS_URL || 'https://mighty-midge-42627.upstash.io',
    token: process.env.REDIS_TOKEN || 'AaaDAAIjcDE0YWQxYzlhOGM0N2M0ZjExOGRhOTQzODBkODVhYjhhMXAxMA'
  },
  production: {
    url: process.env.REDIS_URL || '',
    token: process.env.REDIS_TOKEN || ''
  },
  test: {
    url: process.env.TEST_REDIS_URL || process.env.REDIS_URL || '',
    token: process.env.TEST_REDIS_TOKEN || process.env.REDIS_TOKEN || ''
  }
};

const getConfig = (): RedisConfig => {
  const config = redisConfig[env];
  if (!config.url || !config.token) {
    const error = `Missing required Redis configuration for environment: ${env}`;
    logger.error(error);
    throw new Error(error);
  }
  return config;
};

export default getConfig();