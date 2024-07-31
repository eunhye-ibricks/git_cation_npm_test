import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
import { SearchModule } from './search/search.module';
import { ConfigModule } from '@nestjs/config';
import { validationSchema } from 'config/validationSchema';
import { GatewayModule } from './gateway/gateway.module';
import { ScheduleModule } from '@nestjs/schedule';
import configuration from 'config/configuration';
import { LoggerMiddleware } from './utils/middleware/logger.middleware';
import { SampleModule } from './sample/sample.module';
@Module({
  imports: [
    SearchModule,
    GatewayModule,
    ConfigModule.forRoot({
      envFilePath: [`./config/env/.${process.env.NODE_ENV}.env`],
      load: [configuration],
      isGlobal: true,
      validationSchema,
    }),
    ScheduleModule.forRoot(),
    SampleModule,
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(LoggerMiddleware).forRoutes('*');
  }
}
