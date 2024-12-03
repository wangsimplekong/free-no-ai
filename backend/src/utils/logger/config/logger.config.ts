import path from 'path';
import { LoggerOptions } from '../types/logger.types';

const LOG_DIR = path.join(process.cwd(), 'logs');
const env = process.env.NODE_ENV || 'development';

interface LoggerFileConfig {
  error: string;
  info: string;
  access: string;
  combined: string;
}

interface EnvironmentConfig extends LoggerOptions {
  files: LoggerFileConfig;
  logDir: string;
  console: boolean;
}

const loggerConfig: Record<string, EnvironmentConfig> = {
  development: {
    level: 'info',
    format: 'pretty',
    logDir: LOG_DIR,
    console: true,
    files: {
      error: 'error-%DATE%.log',
      info: 'info-%DATE%.log',
      access: 'access-%DATE%.log',
      combined: 'combined-%DATE%.log'
    },
    maxFiles: '14d',
    maxSize: '20m'
  },
  production: {
    level: 'info',
    format: 'json',
    logDir: LOG_DIR,
    console: false,
    files: {
      error: 'error-%DATE%.log',
      info: 'info-%DATE%.log',
      access: 'access-%DATE%.log',
      combined: 'combined-%DATE%.log'
    },
    maxFiles: '30d',
    maxSize: '50m'
  },
  test: {
    level: 'info',
    format: 'pretty',
    logDir: LOG_DIR,
    console: true,
    files: {
      error: 'test-error-%DATE%.log',
      info: 'test-info-%DATE%.log',
      access: 'test-access-%DATE%.log',
      combined: 'test-combined-%DATE%.log'
    },
    maxFiles: '7d',
    maxSize: '10m'
  }
};

export const getLoggerConfig = (): EnvironmentConfig => {
  const config = loggerConfig[env];
  if (!config) {
    throw new Error(`Invalid environment: ${env}`);
  }
  return config;
};

export const getLogFilePath = (type: keyof LoggerFileConfig): string => {
  const config = getLoggerConfig();
  return path.join(config.logDir, config.files[type]);
};