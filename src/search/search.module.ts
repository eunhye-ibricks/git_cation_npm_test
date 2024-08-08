import { Logger, Module } from '@nestjs/common';
import { SearchController } from './search.controller';
import { SearchService } from './search.service';
import { SearchModel } from './search.model';
import { GatewayModule } from 'src/gateway/gateway.module';
import { EsModule } from '../elasticsearch-module/elasticsearch-module';
@Module({
  imports: [GatewayModule, EsModule],
  controllers: [SearchController],
  providers: [SearchService, Logger, SearchModel],
  exports: [SearchService],
})
export class SearchModule {}
