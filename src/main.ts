/* eslint-disable @typescript-eslint/no-non-null-assertion */
import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { config as swaggerConfig } from './utils/swagger/swagger.config';
import { AllExceptionsFilter } from './utils/filter/all-exception.filter';
import { terminate } from './utils/process/terminate';
import { WinstonLoggerService } from './utils/logger/winston.service';

async function bootstrap() {
  const logger = new WinstonLoggerService();

  const app = await NestFactory.create(AppModule, {
    logger,
  });

  const exitHandler = terminate(app, {
    coredump: false,
    timeout: 1000,
  });

  process.on('uncaughtException', exitHandler(1, 'Unexpected Error'));
  process.on('unhandledRejection', exitHandler(1, 'Unhandled Promise'));
  process.on('SIGTERM', exitHandler(0, 'SIGTERM'));
  process.on('SIGINT', exitHandler(0, 'SIGINT'));
  process.on('exit', exitHandler(0, 'process.exit()'));

  const configService = app.get(ConfigService);
  const env = configService.get<string>('NODE_ENV')!;
  const port = configService.get<number>('APP_PORT')!;
  const searchEngine = configService.get<string>('SEARCH_ENGINE')!;
  const nodes = configService.get<string>('NODES')!;

  logger.log(
    '*************************** Config ***************************\n',
  );
  logger.log(`NODE_ENV: ${env}`);
  logger.log(`App Port: ${port}`);
  logger.log(`Search Engine: ${searchEngine}`);
  logger.log(`Nodes: ${nodes}\n`);
  logger.log('**************************** End *****************************');

  const httpAdapter: HttpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter, logger));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );
  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);

  // app.enableShutdownHooks();
  await app.listen(port);
}
bootstrap();
