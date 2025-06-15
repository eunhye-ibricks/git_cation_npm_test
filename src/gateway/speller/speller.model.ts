import { Inject, Injectable, Logger } from '@nestjs/common';
import { WinstonLoggerService } from '../../utils/logger/winston.service';
import { SearchEngine } from 'src/search-engine/search-engine.interface';
import { SearchResult } from '../gateway.interfaces';

@Injectable()
export class SpellerModel {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    @Inject('SearchEngine') private readonly searchEngine: SearchEngine,
  ) {}

  async getSpellerLabel(): Promise<SearchResult> {
    const index = '.openquery';
    const body = {
      size: 100,
      query: {
        exists: {
          field: 'speller',
        },
      },
    };

    const searchResponse = await this.searchEngine.search({ index, body });

    return { searchResponse, index };
  }

  async getSpellerTimestamp(label: string): Promise<SearchResult> {
    const index = '.openquery-speller';
    const body = {
      size: 1,
      query: {
        match: {
          label: label,
        },
      },
      sort: [
        {
          timestamp: {
            order: 'desc',
          },
        },
      ],
    };
    const searchResponse = await this.searchEngine.search({ index, body });

    return { searchResponse, index };
  }

  async getSpellerData(
    label: string,
    scrollId: string | null,
  ): Promise<SearchResult> {
    const index = '.openquery-speller';
    const scrollTime = '30s';

    if (scrollId === null) {
      const body = {
        size: 1000,
        query: {
          match: {
            label: label,
          },
        },
        sort: [
          {
            timestamp: {
              order: 'desc',
            },
          },
        ],
      };

      const searchResponse = await this.searchEngine.search({
        index,
        scroll: scrollTime,
        body,
      });
      return { searchResponse, index };
    }

    const searchResponse = await this.searchEngine.scroll({
      scroll_id: scrollId,
      rest_total_hits_as_int: true,
      scroll: '30s',
    });

    return { searchResponse, index };
  }
}
