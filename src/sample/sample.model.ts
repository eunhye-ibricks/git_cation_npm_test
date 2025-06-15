import { Inject, Injectable, Logger, LoggerService } from '@nestjs/common';
import * as sampleConfig from './config/sample-config';
import { SampleResult } from './sample.interfaces';
import { FunctionScoreSearchDTO } from './dto/sample-search.dto';
import { SearchEngine } from 'src/search-engine/search-engine.interface';

@Injectable()
export class SampleModel {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    @Inject('SearchEngine') private readonly searchEngine: SearchEngine,
  ) {}

  async functionScoreSearch(
    functionScoreSearchDTO: FunctionScoreSearchDTO,
  ): Promise<SampleResult> {
    const { keyword, size, from } = functionScoreSearchDTO;
    const functionScoreConfig = sampleConfig.functionScoreConfig();
    const index = functionScoreConfig.index.join(',');
    const { fields, body } = functionScoreConfig;

    body.query.bool.must.push({
      multi_match: {
        fields: functionScoreConfig.fields.search,
        query: keyword,
      },
    });

    body._source.includes = fields.result;
    body.size = size;
    body.from = from;

    body.query = {
      function_score: {
        query: body.query,
        functions: functionScoreConfig.functions.functions,
        score_mode: functionScoreConfig.functions.score_mode,
        boost_mode: functionScoreConfig.functions.boost_mode,
      },
    };

    this.logger.log('functionScoreSearch()', JSON.stringify({ index, body }));
    const esResult = await this.searchEngine.search({
      index,
      body,
    });

    return { esResult, index };
  }
}
