import {
  WinstonModule,
  utilities as nestWinstonModuleUtilities,
} from 'nest-winston';
import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import { loggerConfig } from 'config/loggerConfig';
// import DailyRotateFile from 'winston-daily-rotate-file';

const format = winston.format.combine(
  winston.format.timestamp(),
  winston.format.ms(),
  nestWinstonModuleUtilities.format.nestLike('MyApp', {
    colors: false,
    prettyPrint: true,
  }),
);

// const transports = [
//   new WinstonDaily({
//     level: 'log',
//     datePattern: 'YYYY-MM-DD',
//     dirname: `${loggerConfig.path}/logs/info`,
//     filename: '%DATE%.info.log',
//     maxFiles: loggerConfig.log.maxFiles || 30,
//     maxSize: loggerConfig.log.maxSize || '100m',
//     zippedArchive: true,
//   }),
//   new WinstonDaily({
// level: 'debug',
// datePattern: 'YYYY-MM-DD',
// dirname: `${loggerConfig.path}/logs/debug`,
// filename: '%DATE%.debug.log',
// maxFiles: loggerConfig.debug.maxFiles || 1,
// maxSize: loggerConfig.debug.maxSize || '500m',
// zippedArchive: true,
//   }),
// ];

export const logger = WinstonModule.createLogger({
  // level: level(),
  transports: [
    new winston.transports.Console({
      level: 'debug',
      format: winston.format.combine(
        winston.format.timestamp(),
        nestWinstonModuleUtilities.format.nestLike('MyApp', {
          prettyPrint: true,
          colors: true,
        }),
      ),
    }),
    new WinstonDaily({
      level: 'info',
      datePattern: 'YYYY-MM-DD',
      dirname: `${loggerConfig.path}/logs/info`,
      filename: '%DATE%.info.log',
      maxFiles: loggerConfig.log.maxFiles || 30,
      maxSize: loggerConfig.log.maxSize || '100m',
      zippedArchive: true,
      format,
    }),
    new WinstonDaily({
      level: 'debug',
      datePattern: 'YYYY-MM-DD',
      dirname: `${loggerConfig.path}/logs/debug`,
      filename: '%DATE%.debug.log',
      maxFiles: loggerConfig.debug.maxFiles || 1,
      maxSize: loggerConfig.debug.maxSize || '500m',
      zippedArchive: true,
      format,
    }),
  ],
  // format,
});
