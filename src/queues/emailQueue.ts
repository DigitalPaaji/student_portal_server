import { Queue } from "bullmq";

const redisUrl = new URL(
  process.env.REDIS_URL || "redis://127.0.0.1:6379"
);

export const emailQueue = new Queue("emailQueue", {
  connection: {
    host: redisUrl.hostname,
    port: Number(redisUrl.port) || 6379,
    username: redisUrl.username || undefined,
    password: redisUrl.password
      ? decodeURIComponent(redisUrl.password)
      : undefined,
  },
  defaultJobOptions: {
    attempts: 3,

    backoff: {
      type: "exponential",
      delay: 5000,
    },

    removeOnComplete: 100,
    removeOnFail: 500,
  },
});