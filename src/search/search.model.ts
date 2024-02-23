import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as searchConfig from './config/search-config';
import { SearchResult } from './search.interfaces';

@Injectable()
export class SearchModel {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly esService: ElasticsearchService,
  ) {}
  async simpleSearch(
    keyword: string,
    size: number,
    from: number,
  ): Promise<SearchResult> {
    const simpleConfig = searchConfig.simpleConfig();
    const index = simpleConfig.index.join(',');
    const { fields, body } = simpleConfig;

    body.query.bool.must.push({
      multi_match: {
        fields: simpleConfig.fields.search,
        query: keyword,
      },
    });

    body._source.includes = fields.result;
    body.size = size;
    body.from = from;

    this.logger.log(JSON.stringify({ index, body }));
    const esResult = await this.esService.search({
      index,
      body,
    });

    return { esResult, index };
  }
}
