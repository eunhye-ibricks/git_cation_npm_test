export interface BoolQuery<T extends string> {
  bool: {
    must?: MatchQuery<T>[] | MultiMatchQuery<T>[];

    filter?: Array<{
      range: { [field: string]: { gte: number; lte: number } };
    }>;
    // 기타 필요한 필드
    boost?: number;
  };
}

export type MatchQuery<T extends string> = {
  [key in T]?: {
    query: string;
    auto_generate_synonyms_phrase_query: boolean;
    operator?: 'and' | 'or';
    minimum_should_match?: number;
    analyzer?: string;
  };
};

export interface MultiMatchQuery<T extends string> {
  query: string;
  fields: T[];
  auto_generate_synonyms_phrase_query: boolean;
  operator?: 'and' | 'or';
  minimum_should_match?: number;
  analyzer?: string;
}

// export interface TermQuery {
//   term: { [key: string]: string };
// }

// export interface TermsQuery {
//   terms: { [key: string]: string[] };
// }

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
  sort: { [key: string]: { order: 'asc' | 'desc' } }[];
}

export interface HighlightQuery<T extends string> {
  fields: {
    [key in T]?: any;
  };
}

export interface SourceQuery<T> {
  includes: T[];
  excludes: T[];
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
  index: string | string[];
  fields: {
    search: string[];
    highlight: { [key: string]: any };
    result: string[];
  };
  // body: SearchBody;
}

export interface SearchBody<T extends string> {
  query: any;
  size: number;
  _source: SourceQuery<T>;
  from?: number;
  highlight?: HighlightQuery<T>;
  sort?: SortQuery;
  range?: RangeQuery;
}
export type SearchFieldConfig<T extends string> = {
  search: T[];
  source: SourceQuery<T>;
  highlight?: {
    fields: { [K in T]?: object };
  };
};

export interface SimpleBody<T extends string> extends SearchBody<T> {
  query: {
    bool: {
      must: [
        {
          match: MatchQuery<T>;
        },
        {
          match: MatchQuery<T>;
        },
        {
          multi_match: MultiMatchQuery<T> | NonNullable<unknown>;
        },
      ];
    };
  };
}
