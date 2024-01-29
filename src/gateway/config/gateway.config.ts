export const openquery = {
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

export const popquery = {
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

export const hotquery = {
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

export const recommend = {
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

export const related = {
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

export const theme = {
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

export const autocomplete = {
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

// export const getSpellerConfig = async () => {};
