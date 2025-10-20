import { LoggerService } from '@nestjs/common';
import config from '../../../config/configuration';
const loggerConfig = config().logger;

import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import WinstonDaily from 'winston-daily-rotate-file';
import * as Transport from 'winston-transport';
import { getCorrelationId } from '../middleware/correlation-id.store';

export class WinstonLoggerService implements LoggerService {
  private readonly logger: winston.Logger;
  constructor() {
    const colors = {
      error: 'red',
      warn: 'yellow',
      log: 'green',
      debug: 'blue',
    };

    const level = loggerConfig.debug ? 'debug' : 'info';
    const logPath = process.env['LOG_PATH'] || './logs';
    const format = winston.format.combine(
      winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
      winston.format.errors({ stack: true }),
      winston.format.printf((info) => {
        const { level, timestamp, stack } = info;

        // message가 object이면 stringify
        let message = info.message;
        if (typeof message === 'object') {
          try {
            message = JSON.stringify(message, null, 2);
          } catch {
            message = '[Unserializable Object]';
          }
        }
        const correlationId = getCorrelationId() ?? 'N/A';
        const log = `${timestamp} [${level}][${
          process.env.INSTANCE_ID ? process.env.INSTANCE_ID : 0
        }] [${correlationId}]${''}: ${message ? message : ''}${
          stack ? `${stack}` : ''
        }`;

        return log;
      }),
    );

    const transports: Transport[] = [
      new WinstonDaily({
        datePattern: 'YYYY-MM-DD',
        dirname: `${logPath}`,
        filename: '%DATE%.log',
        maxFiles: loggerConfig.log.maxFiles || 30,
        maxSize: loggerConfig.log.maxSize || '100m',
        zippedArchive: false,
      }),
    ];

    const transportConsole = {
      handleExceptions: true,
      // level: 'debug',
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
      ),
    };

    if (loggerConfig.console) {
      transports.push(new winston.transports.Console(transportConsole));
    }
    winston.addColors(colors);

    this.logger = WinstonModule.createLogger({
      level,
      format,
      transports,
    }) as winston.Logger;
  }

  log(message: any) {
    this.logger.log({ level: 'info', message });
  }
  error(message: any) {
    if (message instanceof Error) {
      this.logger.error({ stack: message.stack });
    } else {
      this.logger.error(message);
    }
  }

  warn(message: any) {
    this.logger.log({ level: 'warn', message });
  }
  debug(message: any) {
    this.logger.log({ level: 'debug', message });
  }
  verbose(message: any) {
    this.logger.log({ level: 'verbose', message });
  }
  // fatal?(message: any, ...optionalParams: any[]) {
  //   throw new Error('Method not implemented.');
  // }
}
