import { Inject, Injectable, Logger } from '@nestjs/common';
import { SearchResult } from './search.interfaces';
import { WinstonLoggerService } from '../utils/logger/winston.service';
import { SimpleSearchDTO } from './dto/simple-search.dto';
import { SearchEngine } from 'src/search-engine/search-engine.interface';
import { simpleConfig } from './search.config';
@Injectable()
export class SearchModel {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    @Inject('SearchEngine') private readonly searchEngine: SearchEngine,
  ) {}

  async simpleSearch(dto: SimpleSearchDTO): Promise<SearchResult> {
    const searchConfig = simpleConfig(dto);
    const { body } = searchConfig;
    const index = Array.isArray(searchConfig.index)
      ? searchConfig.index.join(',')
      : searchConfig.index;

    this.logger.log(`simpleSearch() ${JSON.stringify({ index, body })}`);
    const searchResponse = await this.searchEngine.search({ index, body });

    return { searchResponse, index };
  }
}
