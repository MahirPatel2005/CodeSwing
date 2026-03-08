const fs = require('fs');
const path = require('path');
const { updateLeaderboard, getLeaderboard, removeUserFromRoom, redis } = require('../store/redis');
const { generateUserColor } = require('../utils/color');

const LOG_FILE = '/tmp/realtime-debug.log';

function log(msg) {
  const line = `[${new Date().toISOString()}] ${msg}\n`;
  try {
    fs.appendFileSync(LOG_FILE, line);
  } catch (err) {
    // ignore
  }
  console.log(msg);
}

module.exports = (io) => {
  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUserId = null;

    log(`[Socket] New connection: ${socket.id}`);

    socket.on('room:join', async ({ roomId, userId, username, avatar }) => {
      log(`[Presence] User ${username} (${userId}) attempting to join room ${roomId}`);
      try {
        currentRoomId = roomId;
        currentUserId = userId;
        
        socket.join(roomId);
        
        const userColor = generateUserColor(userId);
        
        // Check if user already exists in Redis to preserve charCount
        const key = `room:${roomId}:users`;
        const existingDataRaw = await redis.hget(key, userId);
        let userData;
        
        if (existingDataRaw) {
          const existingData = JSON.parse(existingDataRaw);
          userData = {
            ...existingData,
            status: 'online'
          };
        } else {
          userData = {
            userId,
            username,
            avatar,
            color: userColor,
            charCount: null,
            status: 'online'
          };
        }

        log(`[Presence] Updating Redis for ${userId}...`);
        await updateLeaderboard(roomId, userId, userData);
        
        log(`[Presence] Fetching leaderboard for ${roomId}...`);
        const leaderboard = await getLeaderboard(roomId);
        log(`[Presence] Current leaderboard for ${roomId}: ${JSON.stringify(leaderboard)}`);
        
        // Notify others in the room
        socket.to(roomId).emit('room:user-joined', { userId, username, color: userColor });
        
        // Update everyone with the new leaderboard
        io.to(roomId).emit('room:leaderboard', leaderboard);
      } catch (err) {
        log(`[Presence] ERROR in room:join: ${err.message}`);
        console.error(err);
      }
    });

    socket.on('room:submit-result', async ({ charCount }) => {
      log(`[Presence] Received submission from ${currentUserId} in room ${currentRoomId}. CharCount: ${charCount}`);
      if (!currentRoomId || !currentUserId) {
        log('[Presence] Error: Missing roomId or userId for submission');
        return;
      }

      const key = `room:${currentRoomId}:users`;
      const userDataRaw = await redis.hget(key, currentUserId);
      
      if (userDataRaw) {
        const user = JSON.parse(userDataRaw);
        log(`[Presence] Found user ${user.username} in Redis. Updating score...`);
        await updateLeaderboard(currentRoomId, currentUserId, {
          ...user,
          charCount
        });
        
        const updatedLeaderboard = await getLeaderboard(currentRoomId);
        log(`[Presence] Emitting updated leaderboard for ${currentRoomId}: ${JSON.stringify(updatedLeaderboard)}`);
        
        io.to(currentRoomId).emit('room:submission', {
          userId: currentUserId,
          charCount
        });
        
        io.to(currentRoomId).emit('room:leaderboard', updatedLeaderboard);
      } else {
        log(`[Presence] User ${currentUserId} not found in room ${currentRoomId}`);
      }
    });

    socket.on('room:language-change', ({ language }) => {
      log(`[Presence] Language change to ${language} by ${currentUserId}`);
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit('room:language-changed', { language, userId: currentUserId });
    });

    socket.on('disconnecting', async () => {
      log(`[Presence] User ${currentUserId} disconnecting from room ${currentRoomId}`);
      if (currentRoomId && currentUserId) {
        await removeUserFromRoom(currentRoomId, currentUserId);
        const updatedLeaderboard = await getLeaderboard(currentRoomId);
        
        io.to(currentRoomId).emit('room:user-left', { userId: currentUserId });
        io.to(currentRoomId).emit('room:leaderboard', updatedLeaderboard);
      }
    });
  });
};
