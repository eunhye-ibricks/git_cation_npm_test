import { registerAs } from '@nestjs/config';

export default registerAs('elasticsearch', () => ({
  node: (process.env.ELASTICSEARCH_NODES || 'localhost:9200').split(','),
  maxRetries: 10,
  requestTimeout: 60000,
  pingTimeout: 60000,
  sniffOnStart: true,
}));
