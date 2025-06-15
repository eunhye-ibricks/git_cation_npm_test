import { ApiResponse } from '@elastic/elasticsearch';
import { Search_Response } from '@opensearch-project/opensearch/api';

export interface SearchResult {
  searchResponse: ApiResponse | Search_Response;
  index: string;
  meta?: any;
}

export interface SearchConfig {
  index: string | string[];
  fields: {
    search: string[];
    filter: string[];
    result: string[];
    highlight: {
      [key: string]: any;
    };
  };

  body: any;
}
