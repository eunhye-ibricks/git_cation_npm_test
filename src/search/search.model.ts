import { Inject, Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as searchConfig from './config/search-config';
import { SearchResult } from './search.interfaces';
import { WinstonLoggerService } from '../utils/logger/winston.service';
import { SimpleSearchDTO } from './dto/simple-search.dto';

@Injectable()
export class SearchModel {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly esService: ElasticsearchService,
  ) {}
  async simpleSearch(dto: SimpleSearchDTO): Promise<SearchResult> {
    const simpleConfig = searchConfig.simpleConfig();
    const index = simpleConfig.index.join(',');
    const { fields, body } = simpleConfig;

    body.query.bool.must.push({
      multi_match: {
        fields: simpleConfig.fields.search,
        query: dto.keyword,
      },
    });

    body._source.includes = fields.result;

    body.size = dto.size;
    body.from = dto.from;

    this.logger.log(`simpleSearch() ${JSON.stringify({ index, body })}`);
    const esResult = await this.esService.search({
      index,
      body,
    });

    return { esResult, index };
  }
}
