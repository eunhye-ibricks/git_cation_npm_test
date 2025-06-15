import { Injectable } from '@nestjs/common';
import { EngineType, SearchEngine } from './search-engine.interface';
import { OpensearchClient } from 'nestjs-opensearch';
import {
  Index_Request,
  Scroll_Request,
  Search_Request,
} from '@opensearch-project/opensearch/api';

@Injectable()
export class OpenSearchSearchEngine implements SearchEngine {
  engineType: EngineType = 'opensearch';

  constructor(private readonly client: OpensearchClient) {}

  async search(params: Search_Request) {
    return this.client.search(params);
  }

  async index(params: Index_Request) {
    return this.client.index(params);
  }

  async scroll(params: Scroll_Request) {
    return this.client.scroll(params);
  }

  info() {
    return this.client.info();
  }

  getClient<T = unknown>(): T {
    return this.client as unknown as T;
  }
}
