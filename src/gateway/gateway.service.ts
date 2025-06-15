import {
  Inject,
  Injectable,
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
import { WinstonLoggerService } from '../utils/logger/winston.service';
import { AutocompleteDTO } from './dto/gateway.autocomplete.dto';
import { PopqueryDTO } from './dto/gateway.popquery.dto';
import { HotqueryDTO } from './dto/gateway.hotquery.dto';
import { RecommendDTO } from './dto/gateway.recommend.dto';
import { RelatedDTO } from './dto/gateway.related.dto';
import { ThemeDTO } from './dto/gateway.theme.dto';
import { SpellerDTO } from './dto/gateway.speller.dto';
import { QuerylogDTO } from './dto/gateway.querylog.dto';

@Injectable()
export class GatewayService {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly gatewayModel: GatewayModel,
    private readonly spellerService: SpellerService,
  ) {}

  async popquery(dto: PopqueryDTO): Promise<PopqueryResponseDTO[]> {
    const { name } = gatewayConfig.popquery;
    const { searchResponse } = await this.gatewayModel.popquery(dto.label);

    if (searchResponse.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, dto.label);
    }

    const result = JSON.parse(
      searchResponse.body.hits.hits[0]._source.popqueryJSON,
    );

    return result;
  }

  async hotquery(dto: HotqueryDTO): Promise<HotqueryResponseDTO[]> {
    const { name } = gatewayConfig.hotquery;
    const { searchResponse } = await this.gatewayModel.hotquery(dto);

    if (searchResponse.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, dto.label);
    }
    const result = JSON.parse(
      searchResponse.body.hits.hits[0]._source.hotqueryJSON,
    );

    return result;
  }

  async recommend(dto: RecommendDTO): Promise<string[]> {
    const { name } = gatewayConfig.recommend;
    const { searchResponse } = await this.gatewayModel.recommend(dto);

    if (searchResponse.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, dto.label);
    }

    const recommend = searchResponse.body.hits.hits[0]._source.recommend;

    const result: string[] = recommend
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0);

    return result;
  }

  async related(dto: RelatedDTO): Promise<string[]> {
    const { name } = gatewayConfig.related;
    const { searchResponse } = await this.gatewayModel.related(dto);

    if (searchResponse.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, dto.label);
    }

    const related = searchResponse.body.hits.hits[0]._source.related;

    const result: string[] = related
      .map((e: string) => e.trim())
      .filter((e: string) => e.length > 0);

    return result;
  }

  async theme(dto: ThemeDTO): Promise<string | []> {
    const { name } = gatewayConfig.theme;
    const { searchResponse } = await this.gatewayModel.theme(dto);

    if (searchResponse.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, dto.label);
    }
    const item = searchResponse.body.hits.hits[0]._source;

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

  async autocomplete(dto: AutocompleteDTO): Promise<AutocompleteResponseDTO[]> {
    const { name } = gatewayConfig.autocomplete;
    const autocompleteArr: AutocompleteResponseDTO[] = [];
    const { searchResponse, meta } = await this.gatewayModel.autocomplete(dto);

    const keywordFields = meta.keywordFields;
    if (searchResponse.body.hits.hits.length === 0) {
      return await this.handleZeroResult(name, dto.label);
    }

    searchResponse.body.hits.hits.forEach((hit: any) => {
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

  async speller(dto: SpellerDTO): Promise<SpellerResponse> {
    let correction = '';
    const arr = dto.query.split(/[ \t]/);
    for (let i = 0; i < arr.length; i++) {
      const results = await this.spellerService.correct(
        dto.label,
        arr[i],
        dto.eng2kor,
        dto.distance,
        dto.overflow,
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

  async querylog(dto: QuerylogDTO): Promise<SearchResult> {
    const result = await this.gatewayModel.querylog(dto);
    return result;
  }

  private async handleZeroResult(name: string, label: string): Promise<[]> {
    const labelResp = await this.gatewayModel.labelCheck(name, label);
    if (labelResp.searchResponse.body.hits.hits.length === 0) {
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
