import { ApiResponse } from '@elastic/elasticsearch';
import { Inject, Injectable, Logger } from '@nestjs/common';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { WinstonLoggerService } from 'src/utils/logger/winston.service';

@Injectable()
export class SpellerModel {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly esService: ElasticsearchService,
  ) {}

  async getSpellerLabel(): Promise<SearchResult> {
    // const { index } = gatewayConfig.openquery;
    const index = '.openquery';
    const body = {
      size: 100,
      query: {
        exists: {
          field: 'speller',
        },
      },
    };

    const esResult = await this.esService.search({ index, body });

    return { esResult, index };
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
    const esResult = await this.esService.search({ index, body });

    return { esResult, index };
  }

  async getSpellerData(label: string, scrollId: string): Promise<SearchResult> {
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

      const esResult = await this.esService.search({
        index,
        scroll: scrollTime,
        body,
      });
      return { esResult, index };
    }

    const esResult = await this.esService.scroll({
      scroll_id: scrollId,
      rest_total_hits_as_int: true,
      scroll: '30s',
    });

    return { esResult, index };
  }
}

interface SearchResult {
  esResult: ApiResponse;
  index: string;
}
