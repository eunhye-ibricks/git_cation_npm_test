import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  LoggerService,
} from '@nestjs/common';
import * as gatewayConfig from './config/gateway.config';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import { ApiResponse } from '@elastic/elasticsearch';
import { ResponseError } from '@elastic/elasticsearch/lib/errors';
import _moment from 'moment';
import { SearchResult } from './gateway.interfaces';

@Injectable()
export class GatewayModel {
  constructor(
    @Inject(Logger) private readonly logger: LoggerService,
    private readonly esService: ElasticsearchService,
  ) {}

  async popquery(label: string): Promise<SearchResult> {
    const { index, body } = gatewayConfig.popquery;

    body.query.term.label = label;

    const esResult = await this.esService.search({ index, body });
    this.logger.debug(esResult.body);

    return { esResult, index };
  }

  async hotquery(label: string): Promise<SearchResult> {
    const { index, body } = gatewayConfig.hotquery;

    body.query.term.label = label;

    const esResult = await this.esService.search({ index, body });
    this.logger.debug(esResult.body);

    return { esResult, index };
  }

  async recommend(label: string, keyword: string): Promise<SearchResult> {
    const { index, body } = gatewayConfig.recommend;

    body.query.bool.must.push(
      { match: { label: label } },
      { match: { 'keyword.keyword': keyword } },
    );

    const esResult = await this.esService.search({ index, body });
    this.logger.debug(esResult.body);

    return { esResult, index };
  }

  async related(label: string, keyword: string): Promise<SearchResult> {
    const { index, body } = gatewayConfig.related;

    body.query.bool.must.push(
      { match: { label: label } },
      { match: { 'keyword.keyword': keyword } },
    );

    const esResult = await this.esService.search({ index, body });
    this.logger.debug(esResult.body);

    return { esResult, index };
  }

  async theme(label: string, keyword: string): Promise<SearchResult> {
    const { index, body } = gatewayConfig.theme;

    body.query.bool.must.push(
      { match: { 'keywords.keyword': keyword } },
      { match: { label: label } },
    );

    this.logger.log(JSON.stringify(body));
    const esResult = await this.esService.search({ index, body });

    return { esResult, index };
  }

  async autocomplete(
    label: string,
    keyword: string,
    middle: boolean,
    reverse: boolean,
    size: number,
    sort: string,
  ): Promise<SearchResult> {
    const index = gatewayConfig.autocomplete.index + label;
    const { body } = gatewayConfig.autocomplete;

    const keywordFields: string[] = [];
    keywordFields.push('keyword.autocomplete');
    keywordFields.push('keyword.prefix^10');

    if (middle) {
      keywordFields.push('keyword.autocomplete_middle');
    }

    if (reverse) {
      keywordFields.push('keyword.autocomplete_reverse');
    }

    switch (sort) {
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
    body.size = size;
    body.query.multi_match = {
      query: keyword,
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
        this.logger.error(JSON.stringify(err));
        throw new BadRequestException('해당 label이 존재하지 않습니다.');
      }
      throw err;
    }
    this.logger.debug(JSON.stringify(body));
  }

  async querylog(
    index: string,
    query: string,
    total: number,
    took: number,
  ): Promise<SearchResult> {
    const indices = index
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
      query,
      total,
      took,
    };

    const esResult = await this.esService.index({
      refresh: true,
      index: querylogIndex,
      type: docType,
      body,
    });

    this.logger.log(esResult);
    return { esResult, index };
  }

  async labelCheck(name: string, label: string): Promise<SearchResult> {
    const { index, body } = gatewayConfig.openquery;

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
