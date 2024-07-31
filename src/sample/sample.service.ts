import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import { ResponseCommonDTO } from './dto/response.sample.dto';
import { GatewayService } from 'src/gateway/gateway.service';
import { SampleModel } from './sample.model';
import { FunctionScoreSearchDTO } from './dto/sample-search.dto';

@Injectable()
export class FunctionScoreService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly sampleModel: SampleModel,
    private readonly gatewayService: GatewayService,
  ) {}

  async sampleFunctionScoreSearch(
    functionScoreSearchDTO: FunctionScoreSearchDTO,
  ): Promise<ResponseCommonDTO> {
    const { keyword } = functionScoreSearchDTO;
    const { esResult, index } = await this.sampleModel.functionScoreSearch(
      functionScoreSearchDTO,
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

    this.logger.log('response', JSON.stringify({ index, took, total }));
    this.gatewayService.querylog(index, query, total, took).catch((err) => {
      this.logger.error('querylog faild');
      this.logger.error(err);
      this.logger.error({ index, query, total, took });
    });
    return response;
  }
}
