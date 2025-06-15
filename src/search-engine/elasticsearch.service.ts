import { Injectable } from '@nestjs/common';
import { EngineType, SearchEngine } from './search-engine.interface';
import { ElasticsearchService } from '@nestjs/elasticsearch';

@Injectable()
export class ElasticsearchSearchEngine implements SearchEngine {
  constructor(private readonly client: ElasticsearchService) {}
  engineType: EngineType = 'elasticsearch';

  async search(params: { index: string; body: any; scroll?: string }) {
    return this.client.search(params);
  }

  async index(params: {
    refresh: boolean;
    index: string;
    type: string;
    body: any;
  }) {
    return this.client.index(params);
  }

  scroll(params: {
    scroll_id: string;
    rest_total_hits_as_int: boolean;
    scroll: string;
  }) {
    return this.client.scroll(params);
  }

  info(): Promise<any> {
    return this.client.info();
  }

  getClient<T = unknown>(): T {
    return this.client as unknown as T;
  }
}
