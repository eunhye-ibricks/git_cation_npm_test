export default () => ({
  search_engine: process.env.SEARCH_ENGINE,
  elasticsearch: {
    node: (process.env.NODES || 'http://localhost:9200').split(','),
    maxRetries: 3,
    requestTimeout: 30000,
    pingTimeout: 3000,
  },
  opensearch: {
    node: (process.env.NODES || 'http://localhost:9200').split(','),
    ssl: {
      rejectUnauthorized: false, // TLS 인증서 검증 비활성화
    },
    auth: {
      username: process.env.USERNAME,
      password: process.env.PASSWORD,
    },
    maxRetries: 3,
    requestTimeout: 30000,
    pingTimeout: 3000,
  },
  logger: {
    debug: false, // debug 로그 활성화
    console: true, // console.log 출력 여부(운영 시 false)
    log: {
      maxFiles: 30,
      maxSize: '100m',
    },
  },
});
