import { ApiResponse } from '@elastic/elasticsearch';

export interface SearchResult {
  esResult: ApiResponse;
  index: string;
  meta?: any;
}

export interface BoolQuery {
  bool: {
    must?: Array<MatchQuery> | Array<MultiMatchQuery>;

    filter?: Array<{
      range: { [field: string]: { gte: number; lte: number } };
    }>;
    // 기타 필요한 필드
  };
}

// interface MatchQuery {}

export interface MatchQuery {
  match: { [key: string]: string | { query: string; operator: 'and' | 'or' } };
}

export interface MultiMatchQuery {
  multi_match: { query: string; fields: string[] };
}

export interface TermQuery {
  term: { [key: string]: string };
}

export interface TermsQuery {
  terms: { [key: string]: string[] };
}

export interface RangeQuery {
  range: {
    [key: string]: {
      gt: string | number;
      lt: string | number;
      gte: string | number;
      lte: string | number;
    };
  };
}

export interface SortQuery {
  sort: Array<{ [key: string]: { order: 'asc' | 'desc' } }>;
}

export interface HighlightQuery {
  fields: {
    [key: string]: any;
  };
}

export interface SourceQuery {
  includes?: Array<string>;
  excludes?: Array<string>;
}

export enum DateExpression {
  NOW = 'now',
  YEAR = 'y',
  MONTH = 'M',
  WEEK = 'w',
  DAY = 'd',
  MINUTE = 'm',
  SECOND = 's',
}

export interface SearchConfig {
  index: Array<string>;
  fields: {
    search: Array<string>;
    highlight: { [key: string]: any };
    result: Array<string>;
  };
  body: SearchBody;
}

export interface SearchBody {
  query: any;
  size?: number;
  from?: number;
  _source?: SourceQuery;
  highlight?: HighlightQuery;
  sort?: SortQuery;
}
