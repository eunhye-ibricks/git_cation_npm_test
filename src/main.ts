import { HttpAdapterHost, NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { logger } from './utils/logger/winston';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule } from '@nestjs/swagger';
import { config as swaggerConfig } from './utils/swagger/swagger.config';
import { AllExceptionsFilter } from './utils/filter/all-exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger,
  });
  const configService = app.get(ConfigService);
  logger.log(configService.get('APP_PORT'));
  logger.log(configService.get('ELASTICSEARCH_NODES'));

  const httpAdapter: HttpAdapterHost = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    }),
  );

  const document = SwaggerModule.createDocument(app, swaggerConfig);
  SwaggerModule.setup('docs', app, document);
  await app.listen(configService.get('APP_PORT'));
}
bootstrap();
