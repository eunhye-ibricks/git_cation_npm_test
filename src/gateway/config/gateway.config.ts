type APIName =
  | 'openquery'
  | 'popquery'
  | 'recommend'
  | 'related'
  | 'theme'
  | 'autocomplete';
type IndexName =
  | '.openquery'
  | '.openquery-popquery'
  | '.openquery-recommend'
  | '.openquery-related'
  | '.openquery-theme'
  | '.openquery-autocomplete_';

type GatewayConfig = {
  name: APIName;
  index: IndexName;
  body: any;
};

type ConfigFn = () => GatewayConfig;

export const getLabelCheckConfig: ConfigFn = () => {
  return {
    name: 'openquery',
    index: '.openquery',
    body: {
      size: 10,
      from: 0,
      query: {
        term: {},
      },
    },
  };
};

export const popquery: ConfigFn = () => {
  return {
    name: 'popquery',
    index: '.openquery-popquery',
    body: {
      size: 1,
      query: {
        term: {
          label: {},
        },
      },
      sort: [
        {
          timestamp: {
            order: 'desc',
          },
        },
      ],
      _source: ['popqueryJSON', 'timestamp'],
    },
  };
};

export const hotquery: ConfigFn = () => {
  return {
    name: 'popquery',
    index: '.openquery-popquery',
    body: {
      size: 1,
      query: {
        term: {
          label: {},
        },
      },
      sort: [
        {
          timestamp: {
            order: 'desc',
          },
        },
      ],
      _source: ['hotqueryJSON', 'timestamp'],
    },
  };
};

export const recommend: ConfigFn = () => {
  return {
    name: 'recommend',
    index: '.openquery-recommend',
    body: {
      query: {
        bool: {
          must: [],
        },
      },
      sort: [
        {
          timestamp: {
            order: 'desc',
          },
        },
      ],
    },
  };
};

export const related: ConfigFn = () => {
  return {
    name: 'related',
    index: '.openquery-related',
    body: {
      query: {
        bool: {
          must: [],
        },
      },
      sort: [
        {
          timestamp: {
            order: 'asc',
          },
        },
      ],
    },
  };
};

export const theme: ConfigFn = () => {
  return {
    name: 'theme',
    index: '.openquery-theme',
    body: {
      size: 1,
      query: {
        bool: {
          must: [],
        },
      },
      sort: [
        {
          timestamp: {
            order: 'asc',
          },
        },
      ],
    },
  };
};

export const autocomplete: ConfigFn = () => {
  return {
    name: 'autocomplete',
    index: `.openquery-autocomplete_`,
    body: {
      size: 10,
      query: {
        multi_match: {
          query: '',
          fields: [],
        },
      },
      highlight: {
        pre_tags: '¶HS¶',
        post_tags: '¶HE¶',
        fields: {},
      },
      sort: {},
    },
  };
};
