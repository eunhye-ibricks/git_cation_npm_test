import { Injectable, Inject, LoggerService, Logger } from '@nestjs/common';
import { SearchModel } from './search.model';
import { GatewayService } from 'src/gateway/gateway.service';
import { ResponseCommonDTO } from './dto/response.common.dto';
@Injectable()
export class SearchService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
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
    const response = {
      index,
      took,
      total,
      body,
    };

    // this.logger.log({ index, query, total, took }, 'result');
    this.logger.log(JSON.stringify({ index, took, total }));
    this.gatewayService.querylog(index, query, total, took).catch((err) => {
      this.logger.error('querylog faild');
      this.logger.error(err);
      this.logger.error({ index, query, total, took });
    });
    return response;
  }
}
