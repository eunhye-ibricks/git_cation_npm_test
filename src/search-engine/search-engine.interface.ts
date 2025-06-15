export type EngineType = 'opensearch' | 'elasticsearch';

export interface SearchEngine {
  engineType: EngineType;
  getClient<T = unknown>(): T;
  search(params: { index: string; body: any; scroll?: string }): Promise<any>;
  index(params: {
    refresh: boolean;
    index: string;
    type?: string;
    body: any;
  }): Promise<any>;

  scroll(params: {
    scroll_id: string;
    rest_total_hits_as_int: boolean;
    scroll: string;
  }): Promise<any>;

  info(): Promise<any>;
}
