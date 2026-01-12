import 'dotenv/config';

const _config = {
  PORT: process.env.PORT || 5000,
};

const config = Object.freeze(_config);
export default config;
