import dotenv from "dotenv";
dotenv.config();

import Redis from "ioredis";

const redisUrl = process.env.REDIS_URL;

console.log('RedisUrl is connected', redisUrl);

if (!redisUrl) {
  throw new Error('REDIS_URL environment variable is not set');
}

const redis = new Redis(redisUrl); // 支援 rediss:// (TLS)

export default redis;
