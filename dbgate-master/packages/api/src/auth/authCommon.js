const crypto = require('crypto');

// 开发环境使用固定 secret，避免每次重启后 token 失效
// 生产环境应该使用环境变量 JWT_SECRET 或随机生成
const tokenSecret = process.env.JWT_SECRET || (process.env.NODE_ENV === 'production' ? crypto.randomUUID() : 'dev-secret-key-change-in-production');

function getTokenLifetime() {
  return process.env.TOKEN_LIFETIME || '1d';
}

function getTokenSecret() {
  return tokenSecret;
}

function getStaticTokenSecret() {
  // TODO static not fixed
  return '14813c43-a91b-4ad1-9dcd-a81bd7dbb05f';
}

module.exports = {
  getTokenLifetime,
  getTokenSecret,
  getStaticTokenSecret,
};
