import { Logger, Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { SearchModel } from './search.model';
@Module({
  imports: [
    ElasticsearchModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        node: configService.get('elasticsearch.node'),
        maxRetries: configService.get('elasticsearch.maxRetries'),
        pingTimeout: configService.get('elasticsearch.pingTimeout'),
        sniffOnStart: configService.get('elasticsearch.sniffOnStart'),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [SearchController],
  providers: [SearchService, Logger, SearchModel],
  exports: [SearchService],
})
export class SearchModule {}
