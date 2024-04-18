import { WinstonModule } from 'nest-winston';
import winston from 'winston';
import WinstonDaily from 'winston-daily-rotate-file';
import config from 'config/configuration';
import * as Transport from 'winston-transport';
const loggerConfig = config().logger;

const level = () => {
  return loggerConfig.debugLog ? 'debug' : 'info';
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
    const { level, message, timestamp, stack, error, context, ...extraInfo } =
      info;

    let log = `${timestamp} [${level}][${
      process.env.INSTANCE_ID ? process.env.INSTANCE_ID : 0
    }] ${''}: `;

    if (level === 'error') {
      if (error) {
        log += `${error.stack}`;
      } else {
        if (message) {
          log += message;
        }

        if (Object.getOwnPropertyNames(extraInfo).length > 0) {
          log += JSON.stringify(extraInfo, createReplacer());
        } else if (stack && stack[0]) {
          log += ` ${stack[0]}`;
        }
      }
    } else {
      if (message) {
        log += message;
      }
      if (Object.getOwnPropertyNames(extraInfo).length > 0) {
        log += JSON.stringify(extraInfo, createReplacer());
      }
      if (context) {
        log +=
          typeof context === 'object'
            ? ` ${JSON.stringify(context, createReplacer())}`
            : ` ${context}`;
      }
    }

    return log;
  }),
);

const consoleOpts = {
  handleExceptions: true,
  // level: 'debug',
  format: winston.format.combine(
    winston.format.colorize({ all: true }),
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
  ),
};

const transports: Transport[] = [
  new WinstonDaily({
    datePattern: 'YYYY-MM-DD',
    dirname: `${loggerConfig.path}`,
    filename: '%DATE%.log',
    maxFiles: loggerConfig.log.maxFiles || 30,
    maxSize: loggerConfig.log.maxSize || '100m',
    zippedArchive: true,
  }),
  // new WinstonDaily({
  //   level: 'debug',
  //   datePattern: 'YYYY-MM-DD',
  //   dirname: `${loggerConfig.path}/logs/debug`,
  //   filename: '%DATE%.debug.log',
  //   maxFiles: loggerConfig.debug.maxFiles || 7,
  //   maxSize: loggerConfig.debug.maxSize || '500m',
  //   zippedArchive: true,
  //   // format: format,
  // }),
];

if (process.env.NODE_ENV !== 'production') {
  transports.push(new winston.transports.Console(consoleOpts));
}

// 객체 출력시 순환참조 처리하는 함수
function createReplacer() {
  const seen = new WeakSet();
  return function (key, value) {
    if (typeof value === 'object' && value !== null) {
      if (seen.has(value)) {
        // 순환 참조 발견
        return;
      }
      seen.add(value);
    }
    return value;
  };
}

export const logger = WinstonModule.createLogger({
  level: level(),
  format,
  transports,
});
