import { INestApplication } from '@nestjs/common';
import { WinstonLoggerService } from '../logger/winston.service';

export const terminate = (
  app: INestApplication,
  options = { coredump: false, timeout: 1000 },
) => {
  const logger = new WinstonLoggerService();
  // Exit function
  const exit = (code: number) => {
    options.coredump ? process.abort() : process.exit(code);
  };

  return (code: number, reason: string) =>
    (err: any, _promise: Promise<any>) => {
      if (err && err instanceof Error) {
        // Log error information, use a proper logging library here :)
        logger.error(err);
      }
      logger.error(`Exit Code: ${code}`);
      logger.error(`Reason: ${reason}`);

      // Attempt a graceful shutdown
      app.close();
      setTimeout(exit, options.timeout);
    };
};
