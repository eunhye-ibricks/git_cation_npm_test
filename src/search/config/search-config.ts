import { SearchBody, SearchConfig } from '../search.interfaces';

export const simpleConfig = (): SearchConfig => {
  const index = ['news', 'stock'];
  const fields = {
    search: ['title', 'content', 'reporter'],
    result: ['title', 'reporter'],
    highlight: {
      reporter: {},
      title: {},
      content: {},
    },
  };

  const body: SearchBody = {
    query: {
      bool: {
        must: [],
        filter: [],
      },
    },
    _source: {
      includes: fields.result,
    },
    highlight: {
      fields: fields.highlight,
    },
    size: 10,
    from: 0,
  };

  return {
    index,
    fields,
    body,
  };
};
