import { ElasticsearchClientError } from '@elastic/elasticsearch/lib/errors';
import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  LoggerService,
} from '@nestjs/common';
import { HttpAdapterHost } from '@nestjs/core';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(
    private readonly httpAdapterHost: HttpAdapterHost,
    private readonly logger: LoggerService,
  ) {}

  catch(exception: unknown, host: ArgumentsHost): void {
    // In certain situations `httpAdapter` might not be available in the
    // constructor method, thus we should resolve it here.
    const { httpAdapter } = this.httpAdapterHost;

    const ctx = host.switchToHttp();
    const request = ctx.getRequest<Request>();
    // filter sensitive data
    const safeReqBody = { ...request.body };

    const responseBody: ErrorResponse = {
      statusCode: 500,
      message: '',
      path: httpAdapter.getRequestUrl(ctx.getRequest()),
      timestamp: new Date().toISOString(),
    };

    if (exception instanceof HttpException) {
      responseBody.statusCode = exception.getStatus();
      responseBody.message = exception.message;
    } else if (exception instanceof ElasticsearchClientError) {
      responseBody.statusCode = HttpStatus.BAD_GATEWAY;
      responseBody.message = `${exception.name}: ${exception.message}`;
    } else {
      responseBody.statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
      responseBody.message = 'Internal Service Error';
    }

    const errorInfo = {
      method: request.method,
      url: request.url,
      body: safeReqBody,
      error: exception,
    };

    this.logger.error(exception);
    this.logger.error('Error Info:', errorInfo);

    httpAdapter.reply(ctx.getResponse(), responseBody, responseBody.statusCode);
  }
}

interface ErrorResponse {
  statusCode: number;
  message: string;
  path: string;
  timestamp: string;
}
