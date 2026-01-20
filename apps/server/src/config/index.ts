import 'dotenv/config';

const _config = {
  PORT: process.env.PORT || 5000,
  DATABASE_URL: process.env.DATABASE_URL || '',
  ACCESS_SECRET: process.env.ACCESS_SECRET || '',
  REFRESH_SECRET: process.env.REFRESH_SECRET || '',
  NODE_ENV: process.env.NODE_ENV || 'development',
  APP_URL: process.env.APP_URL || '',

  GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID || '',
  GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET || '',
  GOOGLE_REDIRECT_URL: process.env.GOOGLE_REDIRECT_URL || '',

  NOTION_CLIENT_ID: process.env.NOTION_CLIENT_ID || '',
  NOTION_CLIENT_SECRET: process.env.NOTION_CLIENT_SECRET || '',
  NOTION_REDIRECT_URL: process.env.NOTION_REDIRECT_URL || '',

  GITHUB_CLIENT_ID: process.env.GITHUB_CLIENT_ID || '',
  GITHUB_CLIENT_SECRET: process.env.GITHUB_CLIENT_SECRET || '',
  GITHUB_REDIRECT_URL: process.env.GITHUB_REDIRECT_URL || '',
};

const config = Object.freeze(_config);
export default config;
