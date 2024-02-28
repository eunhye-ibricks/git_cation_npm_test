import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import config from 'config/configuration';

const loggerConfig = config().logger;
// const format = winston.format.combine(
//   winston.format.timestamp(),
//   winston.format.ms(),
//   nestWinstonModuleUtilities.format.nestLike('MyApp', {
//     colors: false,
//     prettyPrint: true,
//   }),
// );

const level = () => {
  const env = process.env.NODE_ENV || 'development';
  const isDevelopment = env === 'development';
  return isDevelopment ? 'debug' : 'debug';
};

const colors = {
  error: 'red',
  warn: 'yellow',
  info: 'green',
  http: 'magenta',
  debug: 'blue',
};

winston.addColors(colors);

const format = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DDTHH:mm:ss.SSSZ' }),
  winston.format.errors({ stack: true }),
  winston.format.printf((info) => {
    const { level, message, timestamp, stack, error, context } = info;
    let log = `${timestamp} [${level}][${
      process.env.INSTANCE_ID ? process.env.INSTANCE_ID : 0
    }] ${''}: `;

    if (level === 'error') {
      if (error && stack) {
        log += `${stack}`;
      } else {
        log += message;
        if (stack?.[0]) {
          log += ` ${JSON.stringify(stack[0])}`;
        }
      }
    } else {
      log += message;
      if (context) {
        log += ` ${context}`;
      }
    }

    return log;
  }),
);

const consoleOpts = {
  handleExceptions: true,
  level: process.env.NODE_ENV === 'production' ? 'error' : 'debug',
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  ),
};

const transports = [
  new winston.transports.Console(consoleOpts),
  new WinstonDaily({
    level: 'info',
    datePattern: 'YYYY-MM-DD',
    dirname: `${loggerConfig.path}/logs/info`,
    filename: '%DATE%.info.log',
    maxFiles: loggerConfig.log.maxFiles || 30,
    maxSize: loggerConfig.log.maxSize || '100m',
    zippedArchive: true,
    // format: format,
  }),
  new WinstonDaily({
    level: 'debug',
    datePattern: 'YYYY-MM-DD',
    dirname: `${loggerConfig.path}/logs/debug`,
    filename: '%DATE%.debug.log',
    maxFiles: loggerConfig.debug.maxFiles || 7,
    maxSize: loggerConfig.debug.maxSize || '500m',
    zippedArchive: true,
    // format: format,
  }),
];
export const logger = WinstonModule.createLogger({
  level: level(),
  format,
  transports,
});
