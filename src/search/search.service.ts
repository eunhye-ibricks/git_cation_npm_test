import { Injectable, Inject, LoggerService, Logger } from '@nestjs/common';
import { SearchModel } from './search.model';

@Injectable()
export class SearchService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly searchModel: SearchModel,
  ) {}
  async simpleSearch(keyword: string, size: number, from: number) {
    const { searchResult, index } = await this.searchModel.simpleSearch(
      keyword,
      size,
      from,
    );

    const body = searchResult.body.hits.hits.map((item) => ({
      ...item._source,
      highlight: item.highlight,
    }));

    const response = {
      meta: {
        index,
        took: searchResult.body.took,
        total: searchResult.body.hits.total.value,
      },
      body,
    };
    this.logger.log(JSON.stringify(response.meta));
    return response;
  }
}
