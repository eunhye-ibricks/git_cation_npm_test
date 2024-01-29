import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { Logger } from '@nestjs/common';
import { SearchModule } from './search/search.module';
import { ConfigModule } from '@nestjs/config';
import elasticsearchConfig from 'config/elasticsearchConfig';
import { validationSchema } from 'config/validationSchema';
import { GatewayModule } from './gateway/gateway.module';
import { ScheduleModule } from '@nestjs/schedule';
@Module({
  imports: [
    SearchModule,
    GatewayModule,
    ConfigModule.forRoot({
      envFilePath: [`./config/env/.${process.env.NODE_ENV}.env`],
      load: [elasticsearchConfig],
      isGlobal: true,
      validationSchema,
    }),
    ScheduleModule.forRoot(),
  ],
  controllers: [AppController],
  providers: [AppService, Logger],
})
export class AppModule {}
