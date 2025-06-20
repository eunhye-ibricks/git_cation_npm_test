import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
import { SearchModule } from './search/search.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from 'config/validationSchema';
import { GatewayModule } from './gateway/gateway.module';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from 'config/configuration';
import { SampleModule } from './sample/sample.module';
import { SearchEngineModule } from './search-engine/search-engine.module';
import { CorrelationIdLoggerInterceptor } from './utils/interceptor/correlation-id-logger.interceptor';
import { APP_INTERCEPTOR } from '@nestjs/core';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: [`./config/env/.${process.env.NODE_ENV}.env`],
      load: [configuration],
      isGlobal: true,
      validationSchema,
    }),
    SearchEngineModule.register(),
    SearchModule,
    GatewayModule,
    ScheduleModule.forRoot(),
    SampleModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Logger,
    {
      provide: APP_INTERCEPTOR,
      useClass: CorrelationIdLoggerInterceptor,
    },
  ],
})
export class AppModule {}
