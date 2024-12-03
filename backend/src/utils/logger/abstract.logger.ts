import { LogMessage, LoggerOptions } from './types/logger.types';

export abstract class AbstractLogger {
    protected options: LoggerOptions;

    constructor(options: LoggerOptions) {
        this.options = options;
    }

    abstract log(message: LogMessage): void;
    abstract error(message: string, metadata?: any): void;
    abstract warn(message: string, metadata?: any): void;
    abstract info(message: string, metadata?: any): void;
    abstract debug(message: string, metadata?: any): void;
    abstract http(message: string, metadata?: any): void;
}