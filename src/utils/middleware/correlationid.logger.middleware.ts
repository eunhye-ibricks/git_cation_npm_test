import { Inject, Injectable, Logger, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { correlationIdStore } from './correlation-id.store';
import { WinstonLoggerService } from '../logger/winston.service';

@Injectable()
export class CorrelationIdMiddleware implements NestMiddleware {
  constructor(@Inject(Logger) private readonly logger: WinstonLoggerService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const store = new Map<string, any>();
    const correlationId =
      req.headers['x-correlation-id']?.toString() || uuidv4();
    store.set('correlationId', correlationId);

    const startTime = Date.now();

    res.setHeader('x-correlation-id', correlationId);

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const method = req.method;
      const url = req.originalUrl;
      const status = res.statusCode;

      const logMessage = `[${method}] ${url} ${status} ${duration}ms\n`;
      this.logger.log(logMessage);
    });

    res.on('close', () => {
      if (!res.writableEnded) {
        const duration = Date.now() - startTime;
        const method = req.method;
        const url = req.originalUrl;

        this.logger.warn(
          `[${method}] ${url} connection closed before response finished (${duration}ms)`,
        );
      }
    });
    correlationIdStore.run(store, () => {
      next();
    });
  }
}
