export default () => ({
  elasticsearch: {
    node: (process.env.ELASTICSEARCH_NODES || 'http://localhost:9200').split(
      ',',
    ),
    maxRetries: 3,
    requestTimeout: 30000,
    pingTimeout: 3000,
    sniffOnStart: true,
  },
  logger: {
    path: '.',
    log: {
      maxFiles: 30,
      maxSize: '100m',
    },
    debug: {
      maxFiles: 1,
      maxSize: '500m',
    },
  },
});
