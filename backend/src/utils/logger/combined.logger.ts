import { AbstractLogger } from './abstract.logger';
import { LogMessage, LoggerOptions } from './types/logger.types';

export class CombinedLogger extends AbstractLogger {
    private loggers: AbstractLogger[];

    constructor(loggers: AbstractLogger[]) {
        super({ level: 'info' });
        this.loggers = loggers;
    }

    log(message: LogMessage): void {
        this.loggers.forEach(logger => {
            try {
                logger.log(message);
            } catch (error) {
                console.error('Failed to log message in combined logger:', error);
            }
        });
    }

    error(message: string, metadata?: any): void {
        this.loggers.forEach(logger => {
            try {
                logger.error(message, metadata);
            } catch (error) {
                console.error('Failed to log error in combined logger:', error);
            }
        });
    }

    warn(message: string, metadata?: any): void {
        this.loggers.forEach(logger => {
            try {
                logger.warn(message, metadata);
            } catch (error) {
                console.error('Failed to log warning in combined logger:', error);
            }
        });
    }

    info(message: string, metadata?: any): void {
        this.loggers.forEach(logger => {
            try {
                logger.info(message, metadata);
            } catch (error) {
                console.error('Failed to log info in combined logger:', error);
            }
        });
    }

    debug(message: string, metadata?: any): void {
        this.loggers.forEach(logger => {
            try {
                logger.debug(message, metadata);
            } catch (error) {
                console.error('Failed to log debug in combined logger:', error);
            }
        });
    }

    http(message: string, metadata?: any): void {
        this.loggers.forEach(logger => {
            try {
                logger.http(message, metadata);
            } catch (error) {
                console.error('Failed to log http in combined logger:', error);
            }
        });
    }
}