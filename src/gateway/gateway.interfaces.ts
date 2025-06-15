import { ApiResponse } from '@elastic/elasticsearch';
import { Search_Response } from '@opensearch-project/opensearch/api';

export interface SearchResult {
  searchResponse: ApiResponse | Search_Response;
  index: string;
  meta?: any;
}
