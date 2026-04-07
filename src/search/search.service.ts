import { Injectable, Inject, Logger } from '@nestjs/common';
import { SearchModel } from './search.model';
import { GatewayService } from '../gateway/gateway.service';
import { ResponseCommonDTO } from './dto/response.common.dto';
import { WinstonLoggerService } from '../utils/logger/winston.service';
import { SimpleSearchDTO } from './dto/simple-search.dto';
import { ThesisSearchDTO } from './dto/thesis-search.dto';
import { PolicyNewsSearchDTO } from './dto/policy-news-search.dto';

@Injectable()
export class SearchService {
  constructor(
    @Inject(Logger) private readonly logger: WinstonLoggerService,
    private readonly searchModel: SearchModel,
    private readonly gatewayService: GatewayService,
  ) {}

  private stripHtml(text: string, preserveEm = true): string {
    if (!text) return '';

    // 1. 스크립트 태그와 그 내용을 완전히 제거 (googletag 등)
    let cleaned = text.replace(/<script\b[^>]*>([\s\S]*?)<\/script>/gim, '');

    // 2. HTML 태그 제거 (em 제외) - 가장 표준적이고 안전한 방식
    const regex = preserveEm ? /<(?!(\/)?em\b)[^>]+>/g : /<[^>]*>/g;
    cleaned = cleaned.replace(regex, '');

    // 3. 불필요한 공백 및 줄바꿈 정제
    cleaned = cleaned
      .replace(/&lt;.*?&gt;/g, '') // 엔티티 제거
      .replace(/\s+/g, ' ')
      .replace(/\n/g, '')
      .trim();

    return cleaned;
  }

  private cleanNewlines(text: string): string {
    if (!text) return '';
    return text.replace(/\n/g, '').trim();
  }

  /**
   * 통합검색
   * @param dto
   */
  async integratedSearch(dto: SimpleSearchDTO): Promise<ResponseCommonDTO> {
    const { searchResponse, index } = await this.searchModel.integratedSearch(
      dto,
    );

    const searchHits = searchResponse.body.hits.hits.map((item: any) => {
      const source = item._source;
      const highlight = item.highlight || {};

      // 통합 검색 결과를 위한 공통 필드 매핑 및 HTML 태그 제거 처리
      const mappedHighlight = {
        title: this.stripHtml(
          highlight.title?.[0] ||
            highlight.title_h?.[0] ||
            source.title ||
            source.title_h,
        ),

        author_reporter: this.stripHtml(
          highlight.reporter?.[0] ||
            highlight.author?.[0] ||
            source.reporter ||
            source.author ||
            '',
        ),

        content: this.stripHtml(
          highlight['content.analyzed']?.[0] ||
            highlight.content?.[0] ||
            highlight.abstract?.[0] ||
            '',
        ),
      };

      return {
        ...source,
        content: this.stripHtml(source.content || source.abstract || ''), // 본문 혹은 초록에서 HTML 제거
        highlight: mappedHighlight,
      };
    });

    const categoryStats = this.processCategoryAggs(
      searchResponse.body.aggregations?.category_filter?.buckets || [],
    );

    const publisherStats =
      searchResponse.body.aggregations?.publisher_filter?.buckets.map(
        (b: any) => ({
          publisher: b.key,
          count: b.doc_count,
        }),
      ) || [];

    const query = dto.keyword;
    const took = searchResponse.body.took;
    const total = searchResponse.body.hits.total.value;

    const responseBody: Array<object> = [
      { results: searchHits },
      { category_stats: categoryStats },
      { publisher_stats: publisherStats }, // 통합 검색에서도 논문 통계 포함
    ];

    const response: ResponseCommonDTO = {
      index: String(index),
      took,
      total,
      body: responseBody,
    };

    this.logger.log(`response: ${JSON.stringify({ index, took, total })}`);
    this.gatewayService
      .querylog({ index: String(index), query, total, took })
      .catch((err) => this.logger.error(`querylog failed: ${err.message}`));

    return response;
  }

  /**
   * thesis 인덱스 전용 검색 서비스
   * @param dto
   */
  async thesisSearch(dto: ThesisSearchDTO): Promise<ResponseCommonDTO> {
    const { searchResponse, index } = await this.searchModel.thesisSearch(dto);

    const searchHits = searchResponse.body.hits.hits.map((item: any) => {
      const source = item._source;
      const highlight = item.highlight || {};

      return {
        ...source,
        highlight: {
          title: this.stripHtml(highlight.title_h?.[0] || source.title_h),
          author: this.stripHtml(highlight.author?.[0] || source.author),
          publisher: this.stripHtml(
            highlight.publisher?.[0] || source.publisher,
          ),
          abstract: this.stripHtml(highlight.abstract?.[0] || source.abstract),
        },
      };
    });

    const publisherStats =
      searchResponse.body.aggregations?.publisher_filter?.buckets.map(
        (b: any) => ({
          publisher: b.key,
          count: b.doc_count,
        }),
      ) || [];

    const took = searchResponse.body.took;
    const total = searchResponse.body.hits.total.value;

    const response: ResponseCommonDTO = {
      index: String(index),
      took,
      total,
      body: [{ results: searchHits }, { publisher_stats: publisherStats }],
    };

    this.logger.log(
      `thesisSearch response: ${JSON.stringify({ index, took, total })}`,
    );
    this.gatewayService
      .querylog({ index: String(index), query: dto.keyword, total, took })
      .catch((err) => this.logger.error(`querylog failed: ${err.message}`));

    return response;
  }

  /**
   * stock 인덱스 전용 검색 서비스
   *
   */
  async stockSearch(dto: SimpleSearchDTO): Promise<ResponseCommonDTO> {
    const { searchResponse, index } = await this.searchModel.stockSearch(dto);

    const searchHits = searchResponse.body.hits.hits.map((item: any) => {
      const source = item._source;
      const highlight = item.highlight || {};

      return {
        ...source,
        content: source.content,
        highlight: {
          title: this.stripHtml(highlight.title?.[0] || source.title),
          author_reporter: this.stripHtml(
            highlight.reporter?.[0] || source.reporter,
          ),
          content: this.stripHtml(highlight['content.analyzed']?.[0] || ''),
        },
      };
    });

    const categoryStats = this.processCategoryAggs(
      searchResponse.body.aggregations?.category_filter?.buckets || [],
    );

    const took = searchResponse.body.took;
    const total = searchResponse.body.hits.total.value;

    const response: ResponseCommonDTO = {
      index: String(index),
      took,
      total,
      body: [{ results: searchHits }, { category_stats: categoryStats }],
    };

    this.logger.log(
      `stockSearch response: ${JSON.stringify({ index, took, total })}`,
    );
    this.gatewayService
      .querylog({ index: String(index), query: dto.keyword, total, took })
      .catch((err) => this.logger.error(`querylog failed: ${err.message}`));

    return response;
  }

  /**
   * policy_news 인덱스 검색 서비스
   * @param dto
   */
  async policyNewsSearch(dto: PolicyNewsSearchDTO): Promise<ResponseCommonDTO> {
    const { searchResponse, index } = await this.searchModel.policyNewsSearch(
      dto,
    );

    const searchHits = searchResponse.body.hits.hits.map((item: any) => {
      const source = item._source;
      const highlight = item.highlight || {};

      const mappedHighlight = {
        title: this.stripHtml(highlight.title?.[0] || source.title),
        sub_title1: this.stripHtml(
          highlight.sub_title1?.[0] || source.sub_title1,
        ),
        sub_title2: this.stripHtml(
          highlight.sub_title2?.[0] || source.sub_title2,
        ),
        sub_title3: this.stripHtml(
          highlight.sub_title3?.[0] || source.sub_title3,
        ),
        data_contents: this.stripHtml(
          highlight.data_contents?.[0] || source.data_contents,
        ),
      };

      return {
        id: source.id,
        title: source.title,
        sub_title1: source.sub_title1,
        sub_title2: source.sub_title2,
        sub_title3: source.sub_title3,
        data_contents: source.data_contents,
        approver_name: source.approver_name,
        minister_code: source.minister_code,
        grouping_code: source.grouping_code,
        contents_status: source.contents_status,
        contents_type: source.contents_type,
        approve_date: source.approve_date,
        modify_date: source.modify_date,
        embargo_date: source.embargo_date,
        original_url: source.original_url,
        thumbnail_url: source.thumbnail_url,
        highlight: mappedHighlight,
      };
    });

    const query = dto.keyword;
    const took = searchResponse.body.took;
    const total = searchResponse.body.hits.total.value;

    const response: ResponseCommonDTO = {
      index: String(index),
      took,
      total,
      body: [{ results: searchHits }],
    };

    this.logger.log(
      `policyNewsSearch response: ${JSON.stringify({ index, took, total })}`,
    );
    this.gatewayService
      .querylog({ index: String(index), query, total, took })
      .catch((err) => this.logger.error(`querylog failed: ${err.message}`));

    return response;
  }

  private processCategoryAggs(buckets: any[]) {
    if (buckets.length <= 5) {
      return buckets.map((b) => ({ category: b.key, count: b.doc_count }));
    }
    const top5 = buckets
      .slice(0, 5)
      .map((b) => ({ category: b.key, count: b.doc_count }));
    const othersCount = buckets
      .slice(5)
      .reduce((acc, cur) => acc + cur.doc_count, 0);
    return [...top5, { category: '기타', count: othersCount }];
  }
}
