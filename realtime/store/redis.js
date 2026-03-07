const Redis = require('ioredis');
require('dotenv').config();

const redisUrl = process.env.REDIS_URL;

if (!redisUrl) {
  console.error('REDIS_URL is not defined in .env file');
  process.exit(1);
}

const redis = new Redis(redisUrl);

redis.on('connect', () => {
  console.log('Successfully connected to Redis');
});

/**
 * Updates a user's character count in a room.
 * @param {string} roomId
 * @param {string} userId
 * @param {object} data { username, charCount, avatar }
 */
async function updateLeaderboard(roomId, userId, data) {
  const key = `room:${roomId}:users`;
  await redis.hset(key, userId, JSON.stringify({
    ...data,
    updatedAt: Date.now()
  }));
}

/**
 * Retrieves the leaderboard for a room, sorted by character count.
 * @param {string} roomId
 * @returns {Promise<Array>} Sorted leaderboard data
 */
async function getLeaderboard(roomId) {
  const key = `room:${roomId}:users`;
  const usersData = await redis.hgetall(key);
  
  return Object.values(usersData)
    .map(data => JSON.parse(data))
    .filter(user => user.charCount !== null)
    .sort((a, b) => a.charCount - b.charCount)
    .map((user, index) => ({
      ...user,
      rank: index + 1
    }));
}

/**
 * Removes a user from a room's presence.
 * @param {string} roomId
 * @param {string} userId
 */
async function removeUserFromRoom(roomId, userId) {
  const key = `room:${roomId}:users`;
  await redis.hdel(key, userId);
}

module.exports = {
  redis,
  updateLeaderboard,
  getLeaderboard,
  removeUserFromRoom
};
