import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import * as searchConfig from './config/search-config';

@Injectable()
export class SearchModel {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly esService: ElasticsearchService,
  ) {}
  async simpleSearch(keyword: string, size: number, from: number) {
    const simpleConfig = searchConfig.simpleConfig();
    const index = simpleConfig.index.join(',');
    const { field, body } = simpleConfig;

    body.query.bool.must.push({
      multi_match: {
        fields: simpleConfig.field.search,
        query: keyword,
      },
    });

    field.highlight.forEach((item) => {
      body.highlight.fields[item] = {};
    });

    body._source = field.result;
    body.size = size;
    body.from = from;

    this.logger.log(JSON.stringify({ index, body }));
    const searchResult = await this.esService.search({
      index,
      body,
    });

    return { searchResult, index };
  }
}
