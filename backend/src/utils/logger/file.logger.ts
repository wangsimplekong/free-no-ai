import { AbstractLogger } from './abstract.logger';
import { LogMessage, LoggerOptions } from './types/logger.types';
import pino from 'pino';
import fs from 'fs';
import path from 'path';

export class FileLogger extends AbstractLogger {
    private logger: pino.Logger;

    constructor(options: LoggerOptions) {
        super(options);
        this.initializeLogger();
    }

    private initializeLogger() {
        try {
            const logDir = path.join(process.cwd(), 'logs');
            if (!fs.existsSync(logDir)) {
                fs.mkdirSync(logDir, { recursive: true });
            }

            const streams = pino.destination({
                dest: path.join(logDir, this.options.filename || 'app.log'),
                sync: false
            });

            this.logger = pino({
                level: this.options.level || 'info',
                timestamp: pino.stdTimeFunctions.isoTime
            }, streams);
        } catch (error) {
            console.error('Failed to initialize file logger:', error);
            throw error;
        }
    }

    log(message: LogMessage): void {
        try {
            this.logger.info(message);
        } catch (error) {
            console.error('Failed to log message to file:', error);
        }
    }

    error(message: string, metadata?: any): void {
        try {
            this.logger.error({ msg: message, ...metadata });
        } catch (error) {
            console.error('Failed to log error to file:', error);
        }
    }

    warn(message: string, metadata?: any): void {
        try {
            this.logger.warn({ msg: message, ...metadata });
        } catch (error) {
            console.error('Failed to log warning to file:', error);
        }
    }

    info(message: string, metadata?: any): void {
        try {
            this.logger.info({ msg: message, ...metadata });
        } catch (error) {
            console.error('Failed to log info to file:', error);
        }
    }

    debug(message: string, metadata?: any): void {
        try {
            this.logger.debug({ msg: message, ...metadata });
        } catch (error) {
            console.error('Failed to log debug to file:', error);
        }
    }

    http(message: string, metadata?: any): void {
        try {
            this.logger.info({ msg: message, type: 'http', ...metadata });
        } catch (error) {
            console.error('Failed to log http to file:', error);
        }
    }
}