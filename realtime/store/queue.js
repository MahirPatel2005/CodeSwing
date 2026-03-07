const Queue = require('bull');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('REDIS_URL is not defined in .env file');
  process.exit(1);
}

// Example queue initialization
const myQueue = new Queue('my-queue', redisUrl);

myQueue.process(async (job) => {
  console.log('Processing job:', job.id, job.data);
  return { result: 'Job completed' };
});

module.exports = myQueue;
