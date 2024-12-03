import dotenv from 'dotenv';

dotenv.config();

const env = process.env.NODE_ENV || 'development';

const loggerConfig = {
    development: {
        level: process.env.LOG_LEVEL || 'debug',
        format: process.env.LOG_FORMAT || 'dev',
        filename: process.env.LOG_FILE_PATH || 'logs/dev-%DATE%.log',
        maxFiles: process.env.LOG_MAX_FILES || '14d',
        maxSize: process.env.LOG_MAX_SIZE || '20m'
    },
    production: {
        level: process.env.LOG_LEVEL || 'info',
        format: process.env.LOG_FORMAT || 'combined',
        filename: process.env.LOG_FILE_PATH || 'logs/prod-%DATE%.log',
        maxFiles: process.env.LOG_MAX_FILES || '30d',
        maxSize: process.env.LOG_MAX_SIZE || '50m'
    },
    test: {
        level: process.env.LOG_LEVEL || 'warn',
        format: process.env.LOG_FORMAT || 'test',
        filename: process.env.LOG_FILE_PATH || 'logs/test-%DATE%.log',
        maxFiles: process.env.LOG_MAX_FILES || '7d',
        maxSize: process.env.LOG_MAX_SIZE || '10m'
    }
};

const getConfig = () => {
    const config = loggerConfig[env];
    if (!config.level || !config.filename) {
        throw new Error(`Missing required Logger configuration for environment: ${env}`);
    }
    return config;
};

export default getConfig();