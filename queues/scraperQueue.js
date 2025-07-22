import { Queue } from 'bullmq';
import redis from '../lib/redisClient.js';

export const scraperQueue = new Queue('scraperQueue', {
  connection: redis,
});
