import { Injectable, Inject, Logger } from '@nestjs/common';
import { SearchModel } from './search.model';
import { GatewayService } from '../gateway/gateway.service';
import { ResponseCommonDTO } from './dto/response.common.dto';
import { WinstonLoggerService } from '../utils/logger/winston.service';
import { SimpleSearchDTO } from './dto/simple-search.dto';
// import { Search_Response } from '@opensearch-project/opensearch/api';
@Injectable()
export class SearchService {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly searchModel: SearchModel,
    private readonly gatewayService: GatewayService,
  ) {}
  async simpleSearch(dto: SimpleSearchDTO): Promise<ResponseCommonDTO> {
    const { searchResponse, index } = await this.searchModel.simpleSearch(dto);

    // const body = (searchResponse as Search_Response).body.hits.hits.map(
    const body = searchResponse.body.hits.hits.map((item: any) => ({
      ...item._source,
      highlight: item.highlight,
    }));

    const query = dto.keyword;
    const took = searchResponse.body.took;
    const total = searchResponse.body.hits.total.value;
    const response: ResponseCommonDTO = {
      index,
      took,
      total,
      body,
    };

    this.logger.log(`response: ${JSON.stringify({ index, took, total })}`);
    this.gatewayService
      .querylog({ index, query, total, took })
      .then()
      .catch((err) => {
        this.logger.error('querylog faild');
        this.logger.error(err);
        this.logger.error({ index, query, total, took });
      });
    return response;
  }
}
