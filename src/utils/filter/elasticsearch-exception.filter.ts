import { ArgumentsHost, Catch, ExceptionFilter } from '@nestjs/common';
import { Request, Response } from 'express';
import { Logger } from '@nestjs/common';
import { ElasticsearchClientError } from '@elastic/elasticsearch/lib/errors';

@Catch(ElasticsearchClientError)
export class ElasticsearchExceptionFilter implements ExceptionFilter {
  private logger = new Logger();

  catch(exception: ElasticsearchClientError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    this.logger.log(exception);
    response.status(502).json({
      name: exception.name,
      statusCode: 502,
      timestamp: new Date().toISOString(),
      path: request.url,
      message: exception.message,
    });
  }
}
