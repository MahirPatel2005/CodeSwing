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

redis.on('error', (err) => {
  console.error('Redis error:', err);
});

/**
 * Updates a user's character count in a room.
 * @param {string} roomId
 * @param {string} userId
 * @param {object} data { username, charCount, avatar }
 */
async function updateLeaderboard(roomId, userId, data) {
  const key = `room:${roomId}:users`;
  try {
    const stringifiedData = JSON.stringify({
      ...data,
      updatedAt: Date.now()
    });
    await redis.hset(key, userId, stringifiedData);
  } catch (err) {
    console.error(`Error in updateLeaderboard:`, err);
    throw err;
  }
}

/**
 * Retrieves the leaderboard for a room, sorted by character count.
 * @param {string} roomId
 * @returns {Promise<Array>} Sorted leaderboard data
 */
async function getLeaderboard(roomId) {
  const key = `room:${roomId}:users`;
  try {
    const usersData = await redis.hgetall(key);
    
    return Object.values(usersData)
      .map(data => {
        try {
          return JSON.parse(data);
        } catch (e) {
          console.error(`Failed to parse user data: ${data}`, e);
          return null;
        }
      })
      .filter(u => u !== null)
      .sort((a, b) => {
        if (a.charCount === null) return 1;
        if (b.charCount === null) return -1;
        return a.charCount - b.charCount;
      })
      .map((user, index) => ({
        ...user,
        rank: user.charCount !== null ? index + 1 : null
      }));
  } catch (err) {
    console.error(`Error in getLeaderboard:`, err);
    throw err;
  }
}

/**
 * Removes a user from a room's presence.
 * @param {string} roomId
 * @param {string} userId
 */
async function removeUserFromRoom(roomId, userId) {
  const key = `room:${roomId}:users`;
  try {
    await redis.hdel(key, userId);
  } catch (err) {
    console.error(`Error in removeUserFromRoom:`, err);
  }
}

module.exports = {
  redis,
  updateLeaderboard,
  getLeaderboard,
  removeUserFromRoom
};
