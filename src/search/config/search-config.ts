import { SearchConfig } from '../search.interfaces';

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

  const body = {
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
    from: 0,
    size: 10,
  };

  return {
    index,
    fields,
    body,
  };
};
