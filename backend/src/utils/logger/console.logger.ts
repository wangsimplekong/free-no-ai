import { AbstractLogger } from './abstract.logger';
import { LogMessage, LoggerOptions } from './types/logger.types';
import pino from 'pino';

export class ConsoleLogger extends AbstractLogger {
    private logger: pino.Logger;

    constructor(options: LoggerOptions) {
        super(options);
        this.initializeLogger();
    }

    private initializeLogger() {
        this.logger = pino({
            level: this.options.level || 'info',
            transport: {
                target: 'pino-pretty',
                options: {
                    colorize: true,
                    translateTime: 'SYS:standard'
                }
            }
        });
    }

    log(message: LogMessage): void {
        try {
            this.logger.info(message);
        } catch (error) {
            console.error('Failed to log message:', error);
        }
    }

    error(message: string, metadata?: any): void {
        try {
            this.logger.error({ msg: message, ...metadata });
        } catch (error) {
            console.error('Failed to log error:', error);
        }
    }

    warn(message: string, metadata?: any): void {
        try {
            this.logger.warn({ msg: message, ...metadata });
        } catch (error) {
            console.error('Failed to log warning:', error);
        }
    }

    info(message: string, metadata?: any): void {
        try {
            this.logger.info({ msg: message, ...metadata });
        } catch (error) {
            console.error('Failed to log info:', error);
        }
    }

    debug(message: string, metadata?: any): void {
        try {
            this.logger.debug({ msg: message, ...metadata });
        } catch (error) {
            console.error('Failed to log debug:', error);
        }
    }

    http(message: string, metadata?: any): void {
        try {
            this.logger.info({ msg: message, type: 'http', ...metadata });
        } catch (error) {
            console.error('Failed to log http:', error);
        }
    }
}