import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './utils/logger/winston';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { config as swaggerConfig } from './utils/swagger/swagger.config';
import { AllExceptionsFilter } from './utils/filter/all-exception.filter';
import { terminate } from './utils/process/terminate';

async function bootstrap() {
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
  logger.log(
    '*************************** Config ***************************\n',
  );
  logger.log(`ENV: ${configService.get('NODE_ENV')}`);
  logger.log(`Port: ${configService.get('APP_PORT')}`);
  logger.log(`ES Nodes: ${configService.get('ELASTICSEARCH_NODES')}\n`);
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
  await app.listen(configService.get('APP_PORT'));
}
bootstrap();
