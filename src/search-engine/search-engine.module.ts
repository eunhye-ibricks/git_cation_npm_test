import { DynamicModule, Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ElasticsearchModule } from '@nestjs/elasticsearch';
import { OpensearchModule } from 'nestjs-opensearch';
import { ElasticsearchSearchEngine } from './elasticsearch.service';
import { OpenSearchSearchEngine } from './openserch.service';

@Global()
@Module({})
export class SearchEngineModule {
  static register(): DynamicModule {
    const configModule = ConfigModule;

    const dynamic: DynamicModule = {
      module: SearchEngineModule,
      global: false,
      imports: [configModule],
      providers: [],
      exports: ['SearchEngine'],
    };

    const configService = new ConfigService();

    const type = configService.get<'elasticsearch' | 'opensearch'>(
      'SEARCH_ENGINE',
    );

    if (type === 'elasticsearch') {
      dynamic.imports?.push(
        ElasticsearchModule.registerAsync({
          inject: [ConfigService],
          useFactory: async (config: ConfigService) => {
            const esConfig = config.get('elasticsearch');
            if (!esConfig) {
              throw new Error(
                '[SearchEngineModule] elasticsearch 설정이 필요합니다',
              );
            }
            return esConfig;
          },
        }),
      );
      dynamic.providers?.push(ElasticsearchSearchEngine, {
        provide: 'SearchEngine',
        useExisting: ElasticsearchSearchEngine,
      });
    } else if (type === 'opensearch') {
      dynamic.imports?.push(
        OpensearchModule.forRootAsync({
          inject: [ConfigService],
          useFactory: async (config: ConfigService) => {
            const osConfig = config.get('opensearch');
            if (!osConfig) {
              throw new Error(
                '[SearchEngineModule] opensearch 설정이 필요합니다',
              );
            }
            return osConfig;
          },
        }),
      );
      dynamic.providers?.push(OpenSearchSearchEngine, {
        provide: 'SearchEngine',
        useExisting: OpenSearchSearchEngine,
      });
    } else {
      throw new Error(
        `[SearchEngineModule] 환경 변수 SEARCH_ENGINE 값이 유효하지 않습니다: ${type}`,
      );
    }

    return dynamic;
  }
}
