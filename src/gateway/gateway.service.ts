import {
  Inject,
  Injectable,
  LoggerService,
  Logger,
  BadRequestException,
} from '@nestjs/common';
import { GatewayModel } from './gateway.model';
import * as gatewayConfig from './config/gateway.config';
import {
  AutocompleteResponseDTO,
  HotqueryResponseDTO,
  PopqueryResponseDTO,
  SpellerResponse,
} from './dto/gateway.responses.dto';
import template from 'string-placeholder';
import { SpellerService } from './speller/speller.service';
import { SearchResult } from './gateway.interfaces';

@Injectable()
export class GatewayService {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly gatewayModel: GatewayModel,
    private readonly spellerService: SpellerService,
  ) {}

  async popquery(label: string): Promise<PopqueryResponseDTO[]> {
    const { name } = gatewayConfig.popquery;
    const { esResult } = await this.gatewayModel.popquery(label);

    if (esResult.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, label);
    }

    const result = JSON.parse(esResult.body.hits.hits[0]._source.popqueryJSON);

    return result;
  }

  async hotquery(label: string): Promise<HotqueryResponseDTO[]> {
    const { name } = gatewayConfig.hotquery;
    const { esResult } = await this.gatewayModel.hotquery(label);

    if (esResult.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, label);
    }
    const result = JSON.parse(esResult.body.hits.hits[0]._source.hotqueryJSON);

    return result;
  }

  async recommend(label: string, keyword: string): Promise<string[]> {
    const { name } = gatewayConfig.recommend;
    const { esResult } = await this.gatewayModel.recommend(label, keyword);

    if (esResult.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, label);
    }

    const recommend = esResult.body.hits.hits[0]._source.recommend;

    const result: string[] = recommend
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0);

    return result;
  }

  async related(label: string, keyword: string): Promise<string[]> {
    const { name } = gatewayConfig.related;
    const { esResult } = await this.gatewayModel.related(label, keyword);

    if (esResult.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, label);
    }

    const related = esResult.body.hits.hits[0]._source.related;

    const result: string[] = related
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0);

    return result;
  }

  async theme(label: string, keyword: string): Promise<string | []> {
    const { name } = gatewayConfig.theme;
    const { esResult } = await this.gatewayModel.theme(label, keyword);

    if (esResult.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, label);
    }
    const item = esResult.body.hits.hits[0]._source;

    const images: { [key: string]: string } = {};
    let no = 1;
    item.images.forEach((ele: string) => {
      images['img' + no] = ele;
      no++;
    });

    this.logger.debug(images);
    this.logger.debug(item.contents);
    const theme = template(item.contents, images);
    return theme;
  }

  async autocomplete(
    label: string,
    keyword: string,
    middle: boolean,
    reverse: boolean,
    size: number,
    sort: string,
  ): Promise<AutocompleteResponseDTO[]> {
    const { name } = gatewayConfig.autocomplete;
    const autocompleteArr: AutocompleteResponseDTO[] = [];
    const { esResult, meta } = await this.gatewayModel.autocomplete(
      label,
      keyword,
      middle,
      reverse,
      size,
      sort,
    );

    const keywordFields = meta.keywordFields;
    if (esResult.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, label);
    }

    esResult.body.hits.hits.forEach((hit: any) => {
      const item = {
        keyword: hit._source.keyword,
        highlight: hit._source.keyword,
        weight: hit._source.weight,
        custom: JSON.parse(hit._source.custom),
      };
      if (hit.highlight) {
        item.highlight = this.highlightReplace(
          item.keyword,
          keywordFields,
          hit.highlight,
        );
      }
      autocompleteArr.push(item);
    });

    return autocompleteArr;
  }

  async speller(
    label: string,
    query: string,
    distance: number,
    eng2kor: boolean,
    overflow: boolean,
  ): Promise<SpellerResponse> {
    let correction = '';
    const arr = query.split(/[ \t]/);
    for (let i = 0; i < arr.length; i++) {
      const results = await this.spellerService.correct(
        label,
        arr[i],
        eng2kor,
        distance,
        overflow,
      );
      if (correction.length > 0) {
        correction += ' ';
      }
      correction += results.length > 0 ? results[0].value.word : arr[i];
    }
    return {
      correction,
    };
  }

  async querylog(
    index: string,
    query: string,
    total: number,
    took: number,
  ): Promise<SearchResult> {
    const result = await this.gatewayModel.querylog(index, query, total, took);
    return result;
  }

  private async handleZeroResult(name: string, label: string): Promise<[]> {
    const labelResp = await this.gatewayModel.labelCheck(name, label);
    if (labelResp.esResult.body.hits.hits.length === 0) {
      throw new BadRequestException('해당 label이 존재하지 않습니다.');
    }
    return [];
  }

  private highlightReplace(
    value: string | string[],
    fields: string[],
    highlight: any,
  ) {
    // if (value.constructor === Array) {
    if (Array.isArray(value)) {
      const ret: any[] = [];

      value.forEach((v) => {
        const every = fields.every((f) => {
          if (
            highlight[f] &&
            v === highlight[f][0].replace(/¶HS¶/g, '').replace(/¶HE¶/g, '')
          ) {
            ret.push(highlight[f][0]);
            return false;
          }
          return true;
        });
        if (every === true) {
          ret.push(v);
        }
      });

      return ret;
    } else {
      let ret = '';

      const every = fields.every((f) => {
        if (highlight[f]) {
          ret = highlight[f][0];
          return false;
        }
        return true;
      });

      return every === true ? value : ret;
    }
  }
}
