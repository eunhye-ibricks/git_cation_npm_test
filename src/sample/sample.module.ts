import { Module, Logger } from '@nestjs/common';
import { FunctionScoreController } from './sample.controller';
import { FunctionScoreService } from './sample.service';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';
import { GatewayModule } from 'src/gateway/gateway.module';
import { SampleModel } from './sample.model';

@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const config = configService.get('elasticsearch');
        if (!config) {
          throw new Error('Elasticsearch configuration is not defined');
        }
        return config;
      },
      inject: [ConfigService],
    }),
    GatewayModule,
  ],
  controllers: [FunctionScoreController],
  providers: [FunctionScoreService, Logger, SampleModel],
  exports: [FunctionScoreService],
})
export class SampleModule {}
