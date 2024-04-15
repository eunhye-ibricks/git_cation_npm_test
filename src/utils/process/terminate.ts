import { INestApplication } from '@nestjs/common';
import { logger } from '../logger/winston';

export const terminate = (
  app: INestApplication,
  options = { coredump: false, timeout: 1000 },
) => {
  // Exit function
  const exit = (code: number) => {
    options.coredump ? process.abort() : process.exit(code);
  };

  return (code: number, reason: string) => (err, promise) => {
    if (err && err instanceof Error) {
      // Log error information, use a proper logging library here :)
      logger.error(err.message, err.stack);
    }
    logger.error(`Exit Code: ${code}`);
    logger.error(`Reason: ${reason}`);

    // Attempt a graceful shutdown
    app.close();
    setTimeout(exit, options.timeout);
  };
};
