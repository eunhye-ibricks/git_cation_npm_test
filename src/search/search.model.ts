import { Inject, Injectable, Logger } from '@nestjs/common';
import { SearchResult } from './search.interfaces';
import { WinstonLoggerService } from '../utils/logger/winston.service';
import { SimpleSearchDTO } from './dto/simple-search.dto';
import { ThesisSearchDTO } from './dto/thesis-search.dto';
import { SearchEngine } from 'src/search-engine/search-engine.interface';
import {
  integratedSearchConfig,
  policyNewsSearchConfig,
  stockSearchConfig,
  thesisSearchConfig,
} from './search.config';
import { PolicyNewsSearchDTO } from './dto/policy-news-search.dto';
@Injectable()
export class SearchModel {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    @Inject('SearchEngine') private readonly searchEngine: SearchEngine,
  ) {}

  async thesisSearch(dto: ThesisSearchDTO): Promise<SearchResult> {
    const searchConfig = thesisSearchConfig(dto);
    const { body } = searchConfig;
    const index = Array.isArray(searchConfig.index)
      ? searchConfig.index.join(',')
      : searchConfig.index;

    this.logger.log(`thesisSearch() ${JSON.stringify({ index, body })}`);
    const searchResponse = await this.searchEngine.search({ index, body });

    return { searchResponse, index };
  }

  async integratedSearch(dto: SimpleSearchDTO): Promise<SearchResult> {
    const searchConfig = integratedSearchConfig(dto);
    const { body } = searchConfig;
    const index = Array.isArray(searchConfig.index)
      ? searchConfig.index.join(',')
      : searchConfig.index;

    this.logger.log(`integratedSearch() ${JSON.stringify({ index, body })}`);
    const searchResponse = await this.searchEngine.search({ index, body });

    return { searchResponse, index };
  }

  async stockSearch(dto: SimpleSearchDTO): Promise<SearchResult> {
    const searchConfig = stockSearchConfig(dto);
    const { body } = searchConfig;
    const index = Array.isArray(searchConfig.index)
      ? searchConfig.index.join(',')
      : searchConfig.index;

    this.logger.log(`stockSearch() ${JSON.stringify({ index, body })}`);
    const searchResponse = await this.searchEngine.search({ index, body });

    return { searchResponse, index };
  }

  async policyNewsSearch(dto: PolicyNewsSearchDTO): Promise<SearchResult> {
    const searchConfig = policyNewsSearchConfig(dto);
    const { body } = searchConfig;
    const index = Array.isArray(searchConfig.index)
      ? searchConfig.index.join(',')
      : searchConfig.index;

    this.logger.log(`policyNewsSearch() ${JSON.stringify({ index, body })}`);
    const searchResponse = await this.searchEngine.search({ index, body });

    return { searchResponse, index };
  }
}
