import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
} from '@nestjs/common';
import * as gatewayConfig from './config/gateway.config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ResponseError } from '@elastic/elasticsearch/lib/errors';
import _moment from 'moment';
import { SearchResult } from './gateway.interfaces';
import { WinstonLoggerService } from '../utils/logger/winston.service';
import { AutocompleteDTO } from './dto/gateway.autocomplete.dto';
import { HotqueryDTO } from './dto/gateway.hotquery.dto';
import { RecommendDTO } from './dto/gateway.recommend.dto';
import { RelatedDTO } from './dto/gateway.related.dto';
import { ThemeDTO } from './dto/gateway.theme.dto';
import { QuerylogDTO } from './dto/gateway.querylog.dto';

@Injectable()
export class GatewayModel {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly esService: ElasticsearchService,
  ) {}

  async popquery(label: string): Promise<SearchResult> {
    const { index, body } = gatewayConfig.popquery();

    body.query.term.label = label;

    const esResult = await this.esService.search({ index, body });
    this.logger.debug(esResult.body);

    return { esResult, index };
  }

  async hotquery(dto: HotqueryDTO): Promise<SearchResult> {
    const { index, body } = gatewayConfig.hotquery();

    body.query.term.label = dto.label;

    const esResult = await this.esService.search({ index, body });
    this.logger.debug(esResult.body);

    return { esResult, index };
  }

  async recommend(dto: RecommendDTO): Promise<SearchResult> {
    const { index, body } = gatewayConfig.recommend();

    body.query.bool.must.push(
      { match: { label: dto.label } },
      { match: { 'keyword.keyword': dto.keyword } },
    );

    const esResult = await this.esService.search({ index, body });
    this.logger.debug(esResult.body);

    return { esResult, index };
  }

  async related(dto: RelatedDTO): Promise<SearchResult> {
    const { index, body } = gatewayConfig.related();

    body.query.bool.must.push(
      { match: { label: dto.label } },
      { match: { 'keyword.keyword': dto.keyword } },
    );

    const esResult = await this.esService.search({ index, body });
    this.logger.debug(esResult.body);

    return { esResult, index };
  }

  async theme(dto: ThemeDTO): Promise<SearchResult> {
    const { index, body } = gatewayConfig.theme();

    body.query.bool.must.push(
      { match: { 'keywords.keyword': dto.keyword } },
      { match: { label: dto.label } },
    );

    this.logger.log(JSON.stringify(body));
    const esResult = await this.esService.search({ index, body });

    return { esResult, index };
  }

  async autocomplete(dto: AutocompleteDTO): Promise<SearchResult> {
    const index = gatewayConfig.autocomplete().index + dto.label;
    const { body } = gatewayConfig.autocomplete();

    const keywordFields: string[] = [];
    keywordFields.push('keyword.autocomplete');
    keywordFields.push('keyword.prefix^10');

    if (dto.middle) {
      keywordFields.push('keyword.autocomplete_middle');
    }

    if (dto.reverse) {
      keywordFields.push('keyword.autocomplete_reverse');
    }

    switch (dto.sort) {
      case 'keyword':
        body.sort = [
          { _score: { order: 'desc' } },
          { weight: { order: 'desc' } },
          { 'keyword.keyword': { order: 'asc' } },
        ];
      case 'weight':
        body.sort = [
          { _score: { order: 'desc' } },
          { weight: { order: 'desc' } },
          { 'keyword.keyword': { order: 'asc' } },
        ];
        break;
    }
    body.size = dto.size;
    body.query.multi_match = {
      query: dto.keyword,
      fields: keywordFields,
    };

    keywordFields.forEach((field) => {
      body.highlight.fields[field] = {};
    });
    try {
      const esResult = await this.esService.search({ index, body });
      return { esResult, index, meta: { keywordFields } };
    } catch (err) {
      if (
        err instanceof ResponseError &&
        err.message === 'index_not_found_exception'
      ) {
        this.logger.error(err);
        throw new BadRequestException('해당 label이 존재하지 않습니다.');
      }
      throw err;
    }
  }

  async querylog(dto: QuerylogDTO): Promise<SearchResult> {
    const indices = dto.index
      .split(',')
      .map((s) => s.trim())
      .sort((a, b) => {
        return a < b ? -1 : a > b ? 1 : 0;
      })
      .join(',');

    const now = _moment();
    const querylogIndex = `.openquery-querylog-${now.format('YYYYMMDD')}`;
    const timestamp = now.format('YYYY-MM-DDTHH:mm:ss.SSSZ');
    const docType = 'doc';
    const body = {
      indices,
      timestamp,
      query: dto.query,
      total: dto.total,
      took: dto.took,
    };

    const esResult = await this.esService.index({
      refresh: true,
      index: querylogIndex,
      type: docType,
      body,
    });

    return { esResult, index: dto.index };
  }

  async labelCheck(name: string, label: string): Promise<SearchResult> {
    const { index, body } = gatewayConfig.getLabelCheckConfig();

    switch (name) {
      case 'popquery':
      case 'hotquery':
        body.query.term = { 'popquery.label': { value: label } };
        break;
      case 'recommend':
        body.query.term = { 'recommend.label': { value: label } };
        break;
      case 'related':
        body.query.term = { 'related.label': { value: label } };
        break;
      case 'autocomplete':
        body.query.term = { 'autocomplete.label': { value: label } };
        break;
      case 'theme':
        body.query.term = { 'theme.label': { value: label } };
    }

    const esResult = await this.esService.search({
      index,
      body,
    });

    return { esResult, index };
  }
}
