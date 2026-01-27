import 'dotenv/config';

const _config = {
  DATABASE_URL: process.env.DATABASE_URL || '',
  REDIS_HOST: process.env.REDIS_HOST || 'localhost',
  REDIS_PORT: parseInt(process.env.REDIS_PORT || '6379'),
};

const config = Object.freeze(_config);
export default config;
