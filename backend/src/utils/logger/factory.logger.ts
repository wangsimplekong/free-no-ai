import { LoggerOptions } from './types/logger.types';
import { FileLogger } from './file.logger';
import { ConsoleLogger } from './console.logger';
import { CombinedLogger } from './combined.logger';

export class LoggerFactory {
    static createLogger(type: 'file' | 'console' | 'both', options: LoggerOptions) {
        try {
            switch(type) {
                case 'file':
                    return new FileLogger(options);
                case 'console':
                    return new ConsoleLogger(options);
                case 'both':
                    return new CombinedLogger([
                        new FileLogger(options),
                        new ConsoleLogger(options)
                    ]);
                default:
                    throw new Error('Invalid logger type');
            }
        } catch (error) {
            console.error('Failed to create logger:', error);
            // Fallback to console logger in case of failure
            return new ConsoleLogger({ level: 'info' });
        }
    }
}