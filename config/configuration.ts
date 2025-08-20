import * as fs from 'fs';
import * as path from 'path';

const configPath = path.resolve(process.cwd(), 'config/config.json');
let fileConfig: any = {};

try {
  const raw = fs.readFileSync(configPath, 'utf-8');
  fileConfig = JSON.parse(raw);
} catch (err) {
  console.warn(
    '⚠️ config.json 파일을 읽을 수 없습니다. 환경 변수만 사용됩니다.',
  );
}

// 기본값
const defaultSearchEngineConfig = {
  maxRetries: 3,
  requestTimeout: 30000,
  pingTimeout: 3000,
};

const defaultLoggerConfig = {
  debug: false,
  console: true,
  log: {
    maxFiles: 30,
    maxSize: '100m',
  },
};

export default () => ({
  search_engine: process.env.SEARCH_ENGINE,

  elasticsearch: {
    node: (process.env.SEARCH_ENGINE_NODES || 'http://localhost:9200').split(
      ',',
    ),
    ...defaultSearchEngineConfig,
    ...(fileConfig['search-engine'] || {}),
  },

  opensearch: {
    node: (process.env.SEARCH_ENGINE_NODES || 'http://localhost:9200').split(
      ',',
    ),
    ssl: {
      rejectUnauthorized: false,
    },
    auth: {
      username: process.env.SEARCH_ENGINE_USERNAME,
      password: process.env.SEARCH_ENGINE_PASSWORD,
    },
    ...defaultSearchEngineConfig,
    ...(fileConfig['search-engine'] || {}),
  },

  logger: {
    ...defaultLoggerConfig,
    ...(fileConfig.logger || {}),
  },
});
