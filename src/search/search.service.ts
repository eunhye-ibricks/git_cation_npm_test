import { Injectable, Inject, Logger } from '@nestjs/common';
import { SearchModel } from './search.model';
import { GatewayService } from '../gateway/gateway.service';
import { ResponseCommonDTO } from './dto/response.common.dto';
import { WinstonLoggerService } from '../utils/logger/winston.service';
@Injectable()
export class SearchService {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly searchModel: SearchModel,
    private readonly gatewayService: GatewayService,
  ) {}
  async simpleSearch(
    keyword: string,
    size: number,
    from: number,
  ): Promise<ResponseCommonDTO> {
    const { esResult, index } = await this.searchModel.simpleSearch(
      keyword,
      size,
      from,
    );

    const body = esResult.body.hits.hits.map((item: any) => ({
      ...item._source,
      highlight: item.highlight,
    }));

    const query = keyword;
    const took = esResult.body.took;
    const total = esResult.body.hits.total.value;
    const response: ResponseCommonDTO = {
      index,
      took,
      total,
      body,
    };

    this.logger.log(`response: ${JSON.stringify({ index, took, total })}`);
    this.gatewayService.querylog(index, query, total, took).catch((err) => {
      this.logger.error('querylog faild');
      this.logger.error(err);
      this.logger.error({ index, query, total, took });
    });
    return response;
  }
}
