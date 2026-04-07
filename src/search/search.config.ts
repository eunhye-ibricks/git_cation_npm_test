import { Search_RequestBody } from '@opensearch-project/opensearch/api';
import { SimpleSearchDTO } from './dto/simple-search.dto';
import { ThesisSearchDTO } from './dto/thesis-search.dto';
import { PolicyNewsSearchDTO } from './dto/policy-news-search.dto';
import { SearchConfig } from './search.interfaces';

export const stockSearchConfig = (dto: SimpleSearchDTO): SearchConfig => {
  const index = ['stock'];

  const fields = {
    search: [
      'title',
      'reporter',
      'content.analyzed',
      'content.ngram', // N-gram 기반 부분 일치 검색용
      'title.ngram', // N-gram 기반 부분 일치 검색용
    ],
    filter: ['category', 'update_dttm'],
    result: ['*'],
    highlight: {
      title: {},
      'title.ngram': {},
      reporter: {},
      'content.analyzed': {
        fragment_size: 200,
        number_of_fragments: 1,
        no_match_size: 150,
      },
      'content.ngram': {
        fragment_size: 200,
        number_of_fragments: 1,
        no_match_size: 150,
      },
    },
  };

  const body: Search_RequestBody = {
    query: {
      function_score: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: dto.keyword,
                  fields: fields.search,
                  operator: 'or',
                },
              },
            ],
            filter: [
              {
                range: {
                  update_dttm: {
                    gte: dto.startDate || '2021-01-01',
                    ...(dto.endDate && { lte: dto.endDate }),
                  },
                },
              },
            ],
          },
        },
        functions: [
          {
            filter: { match: { title: dto.keyword } },
            weight: 2,
          },
          {
            gauss: {
              update_dttm: {
                origin: 'now',
                scale: '180d',
                offset: '30d',
                decay: 0.5,
              },
            },
            weight: 1.5,
          },
        ],
        score_mode: 'multiply',
        boost_mode: 'multiply',
      },
    },
    aggs: {
      category_filter: {
        terms: {
          field: 'category',
          size: 10,
        },
      },
    },
    sort: [{ _score: 'desc' }, { update_dttm: 'desc' }],
    _source: true,
    highlight: {
      fields: fields.highlight,
    },
    size: dto.size || 10,
    from: dto.from || 0,
  };

  return { index, fields, body };
};

export const policyNewsSearchConfig = (
  dto: PolicyNewsSearchDTO,
): SearchConfig => {
  const index = 'policy_news';

  const fields = {
    search: [
      'title',
      'sub_title1',
      'sub_title2',
      'sub_title3',
      'data_contents',
      'approver_name',
    ],
    filter: [
      'contents_status',
      'contents_type',
      'grouping_code',
      'minister_code',
      'approve_date',
    ],
    result: ['*'],
    highlight: {
      title: {},
      sub_title1: {},
      sub_title2: {},
      sub_title3: {},
      data_contents: {
        fragment_size: 200,
        number_of_fragments: 3,
        no_match_size: 150,
      },
    },
  };

  const must: any[] = [];
  const should: any[] = [];
  const filter: any[] = [];

  // 기본 검색어 (제목에 가중치)
  if (dto.keyword) {
    must.push({
      multi_match: {
        query: dto.keyword,
        fields: [
          'title^2',
          'sub_title1',
          'sub_title2',
          'sub_title3',
          'data_contents',
          'approver_name',
        ],
      },
    });
  }

  // 결과내 재검색
  if (dto.research_keyword) {
    must.push({
      multi_match: {
        query: dto.research_keyword,
        fields: [
          'title',
          'sub_title1',
          'sub_title2',
          'sub_title3',
          'data_contents',
        ],
        operator: 'and',
      },
    });
  }

  // 필터들
  if (dto.contents_status) {
    filter.push({ term: { contents_status: dto.contents_status } });
  }
  if (dto.contents_type) {
    filter.push({ term: { contents_type: dto.contents_type } });
  }
  if (dto.minister_code) {
    filter.push({ term: { minister_code: dto.minister_code } });
  }
  if (dto.grouping_code) {
    filter.push({ term: { grouping_code: dto.grouping_code } });
  }

  // 날짜 필터 (승인일 기준)
  if (dto.start_date || dto.end_date) {
    const range: any = {};
    if (dto.start_date) range.gte = dto.start_date;
    if (dto.end_date) range.lte = dto.end_date;
    filter.push({ range: { approve_date: range } });
  }

  const body: Search_RequestBody = {
    query: {
      bool: {
        must,
        filter,
        should,
      },
    },
    sort: [{ approve_date: 'desc' }, { _score: 'desc' }],
    _source: true,
    highlight: {
      fields: fields.highlight,
    },
    size: dto.size || 10,
    from: dto.from || 0,
  };

  return { index, fields, body };
};

export const thesisSearchConfig = (dto: ThesisSearchDTO): SearchConfig => {
  const index = 'thesis';

  const fields = {
    search: [
      'title_h',
      'author',
      'author.roman',
      'publisher',
      'abstract',
      'subject',
    ],
    filter: [
      'author.keyword',
      'publish_date',
      'ministry_name',
      'location_org',
      'title_h.keyword', // 정확한 필터링/통계를 위한 키워드 필드
      'publisher.keyword', // 정확한 필터링/통계를 위한 키워드 필드
    ],
    result: [
      'id',
      'identifier',
      'title_h',
      'author',
      'publisher',
      'publish_date',
      'abstract',
      'ministry_name',
      'location_org',
      'deep_link',
      'kmd_format',
      'kmd_language',
    ],
    highlight: {
      title_h: {},
      author: {},
      'author.roman': {},
      publisher: {},
      abstract: {},
    },
  };

  const must: any[] = [];
  const filter: any[] = [];
  const should: any[] = [];

  // 기본 키워드 검색
  if (dto.keyword) {
    const keywords = dto.keyword.split(' ').filter((k) => k.length > 0);

    // 1순위: 모든 키워드가 포함된 데이터 (title_h 우선순위 부여)
    must.push({
      multi_match: {
        query: dto.keyword,
        fields: [
          'title_h^3',
          'abstract',
          'publisher',
          'subject',
          'author',
          'author.roman',
        ],
        operator: 'and',
        type: 'phrase',
      },
    });

    // 2순위, 3순위 등을 위한 should 조건 (개별 키워드 매칭)
    keywords.forEach((word) => {
      should.push({
        match: {
          title_h: {
            query: word,
            boost: 2,
          },
        },
      });
      should.push({
        multi_match: {
          query: word,
          fields: ['abstract', 'publisher', 'subject'],
        },
      });
    });
  }

  // 결과내 재검색
  if (dto.research_keyword) {
    must.push({
      multi_match: {
        query: dto.research_keyword,
        fields: [
          'title_h',
          'abstract',
          'publisher',
          'subject',
          'author',
          'author.roman',
        ],
        operator: 'and',
      },
    });
  }

  // 필터: 저자
  if (dto.author) {
    filter.push({
      term: {
        'author.keyword': dto.author,
      },
    });
  }

  if (dto.stdate || dto.enddate) {
    const range: any = {};
    if (dto.stdate) range.gte = dto.stdate;
    if (dto.enddate) range.lte = dto.enddate;
    filter.push({
      range: {
        publish_date: range,
      },
    });
  }

  if (dto.ministry_name) {
    filter.push({
      term: {
        ministry_name: dto.ministry_name,
      },
    });
  }

  if (dto.location_org) {
    filter.push({
      term: {
        location_org: dto.location_org,
      },
    });
  }

  const body: Search_RequestBody = {
    query: {
      bool: {
        must,
        filter,
        should,
      },
    },
    aggs: {
      publisher_filter: {
        terms: {
          field: 'publisher.keyword',
          size: 5,
        },
      },
    },
    sort: [{ _score: 'desc' }],
    _source: fields.result,
    highlight: {
      fields: fields.highlight,
    },
    size: dto.size || 10,
    from: dto.from || 0,
  };

  return { index, fields, body };
};

export const integratedSearchConfig = (dto: SimpleSearchDTO): SearchConfig => {
  const index = ['stock', 'thesis'];

  const fields = {
    search: [
      'title',
      'reporter',
      'content',
      'content.analyzed',
      'title_h',
      'author',
      'publisher',
      'abstract',
    ],

    filter: ['category', 'update_dttm', 'publish_date'],

    result: [
      'nid',
      'category',
      'title',
      'content', // 본문 내용 추가 (stock)
      'abstract', // 요약 내용 추가 (thesis)
      'update_dttm',
      'reporter',
      'identifier',
      'title_h',
      'author',
      'publisher',
      'publish_date',
    ],

    highlight: {
      title: {},
      reporter: {},
      content: {
        fragment_size: 200,
        number_of_fragments: 1,
        no_match_size: 150,
      },
      'content.analyzed': {
        fragment_size: 200,
        number_of_fragments: 1,
        no_match_size: 150,
      },
      title_h: {},
      author: {},
      abstract: {
        fragment_size: 200,
        number_of_fragments: 1,
        no_match_size: 150,
      },
    },
  };

  const body: Search_RequestBody = {
    query: {
      function_score: {
        query: {
          bool: {
            must: [
              {
                multi_match: {
                  query: dto.keyword,
                  fields: fields.search,
                },
              },
            ],
            filter: [
              {
                range: {
                  update_dttm: {
                    gte: dto.startDate || '2021-01-01',
                    ...(dto.endDate && { lte: dto.endDate }),
                  },
                },
              },
            ],
          },
        },
        functions: [
          {
            filter: {
              bool: {
                should: [
                  { match: { title: dto.keyword } },
                  { match: { title_h: dto.keyword } },
                ],
              },
            },
            weight: 2,
          },
          {
            gauss: {
              update_dttm: {
                origin: 'now',
                scale: '180d',
                offset: '30d',
                decay: 0.5,
              },
            },
            weight: 1.5,
          },
        ],
        score_mode: 'multiply',
        boost_mode: 'multiply',
      },
    },

    aggs: {
      category_filter: {
        // 주식 카테고리 통계
        terms: {
          field: 'category',
          size: 10,
        },
      },
      publisher_filter: {
        // 논문 발행처 통계 추가
        terms: {
          field: 'publisher.keyword',
          size: 5,
        },
      },
    },
    sort: [{ _score: 'desc' }], // 날짜 정렬을 제거하고 정확도 우선 정렬로 변경하여 데이터 편향 방지
    _source: {
      includes: fields.result,
    },
    highlight: {
      fields: fields.highlight,
    },
    size: dto.size || 10,
    from: dto.from || 0,
  };

  return {
    index,
    fields,
    body,
  };
};
