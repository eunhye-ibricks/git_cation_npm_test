import {
  Inject,
  Injectable,
  Logger,
  LoggerService,
  NestMiddleware,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';

@Injectable()
export class LoggerMiddleware implements NestMiddleware {
  constructor(@Inject(Logger) private readonly logger: LoggerService) {}
  use(req: Request, res: Response, next: NextFunction): void {
    const startTime = Date.now();

    res.on('finish', () => {
      const duration = Date.now() - startTime;
      const method = req.method;
      const url = req.originalUrl;
      const status = res.statusCode;

      const logMessage = `[${method}] ${url} ${status} ${duration}ms\n`;
      this.logger.log(logMessage);
    });

    next();
  }
}
