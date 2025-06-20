import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Logger,
  Inject,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { v4 as uuidv4 } from 'uuid';
import { correlationIdStore } from './correlation-id.store';
import { WinstonLoggerService } from '../logger/winston.service';

@Injectable()
export class CorrelationIdLoggerInterceptor implements NestInterceptor {
  constructor(@Inject(Logger) private readonly logger: WinstonLoggerService) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const correlationId = uuidv4();
    const store = new Map<string, any>();
    store.set('correlationId', correlationId);
    correlationIdStore.enterWith(store);

    const now = Date.now();
    const req = context.switchToHttp().getRequest();
    const method = req.method;
    const url = req.originalUrl;

    return next.handle().pipe(
      tap(() => {
        const res = context.switchToHttp().getResponse();
        const status = res.statusCode;
        const duration = Date.now() - now;

        this.logger.log(`[${method}] ${url} ${status} ${duration}ms\n`);
      }),
    );
  }
}
