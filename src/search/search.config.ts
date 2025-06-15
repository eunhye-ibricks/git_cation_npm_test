import { Search_RequestBody } from '@opensearch-project/opensearch/api';
import { SimpleSearchDTO } from './dto/simple-search.dto';
import { SearchConfig } from './search.interfaces';

export const simpleConfig = (dto: SimpleSearchDTO): SearchConfig => {
  const index = ['stock'];
  const fields = {
    search: ['title.kobrick', 'content.kobrick', 'reporter'],
    filter: [],
    result: ['title', 'reporter'],
    highlight: {
      'title.kobrick': {},
      'content.kobrick': {},
    },
  };

  const body: Search_RequestBody = {
    query: {
      bool: {
        must: [
          {
            multi_match: {
              fields: fields.search,
              query: dto.keyword,
            },
          },
        ],
      },
    },
    _source: {
      includes: fields.result,
    },
    highlight: {
      fields: fields.highlight,
    },
    size: dto.size,
    from: dto.from,
  };

  return {
    index,
    fields,
    body,
  };
};
