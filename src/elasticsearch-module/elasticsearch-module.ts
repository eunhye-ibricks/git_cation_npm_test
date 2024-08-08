import { Module } from '@nestjs/common';
import { ElasticsearchModule as NestElasticsearchModule } from '@nestjs/elasticsearch';
import { ConfigService } from '@nestjs/config';

@Module({
  imports: [
    NestElasticsearchModule.registerAsync({
      useFactory: async (configService: ConfigService) => {
        const esConfig = configService.get('elasticsearch');
        if (!esConfig) {
          throw new Error('elasticsearch configuration not found!!!');
        }
        return esConfig;
      },
      inject: [ConfigService],
    }),
  ],
  exports: [NestElasticsearchModule],
})
export class EsModule {}
