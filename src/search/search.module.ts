import { Logger, Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchModel } from './search.model';
import { GatewayModule } from 'src/gateway/gateway.module';
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
  controllers: [SearchController],
  providers: [SearchService, Logger, SearchModel],
  exports: [SearchService],
})
export class SearchModule {}
