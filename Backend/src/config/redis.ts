import Redis from "ioredis";
import { logError } from "../middleware/errorHandler";

const configuredRedisUrl = process.env.REDIS_URL;
if (!configuredRedisUrl) {
  throw new Error("REDIS_URL is not configured");
}

const redisUrl = configuredRedisUrl.replace(
  "${REDIS_PASSWORD}",
  encodeURIComponent(process.env.REDIS_PASSWORD ?? "")
);

const redis = new Redis(redisUrl);

redis.on("connect", () => {
  console.info("[Redis] connected");
});

redis.on("error", (err) => {
  logError("Redis connection error", err);
});

export default redis;