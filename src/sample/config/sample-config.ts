import { FunctionScoreQuery, SearchBody } from '../sample.interfaces';

export const functionScoreConfig = (): FunctionScoreQuery => {
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

  //field_value_factor 기준
  const functions = {
    boost_mode: 'multiply',
    score_mode: 'sum',
    functions: [
      {
        field_value_factor: {
          field: '_score',
          factor: 1.2,
          modifier: 'log2p',
          missing: 0,
        },
      },
    ],
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
  };

  return {
    index,
    fields,
    functions,
    body,
  };
};
