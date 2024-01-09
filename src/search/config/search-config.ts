interface SearchConfig {
  index: Array<string>;
  field: {
    search: Array<string>;
    highlight: Array<string>;
    result: Array<string>;
  };
  body: {
    from: number;
    size: number;
    query: any;
    _source: any;
    highlight: any;
  };
}

export const simpleConfig = (): SearchConfig => ({
  index: ['news', 'stock'],
  field: {
    search: ['title', 'content'],
    highlight: ['reporter', 'title', 'content'],
    result: ['title'],
  },
  body: {
    from: 0,
    size: 0,
    query: {
      bool: {
        must: [],
        filter: [],
        should: [],
      },
    },
    _source: [],
    highlight: {
      fields: {},
    },
  },
});
