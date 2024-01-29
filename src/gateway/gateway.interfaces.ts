import { ApiResponse } from '@elastic/elasticsearch';

export interface SearchResult {
  esResult: ApiResponse;
  index: string;
  meta?: any;
}
