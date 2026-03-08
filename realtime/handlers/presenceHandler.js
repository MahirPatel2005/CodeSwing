const { updateLeaderboard, getLeaderboard, removeUserFromRoom } = require('../store/redis');
const { generateUserColor } = require('../utils/color');

module.exports = (io) => {
  io.on('connection', (socket) => {
    let currentRoomId = null;
    let currentUserId = null;

    socket.on('room:join', async ({ roomId, userId, username, avatar }) => {
      currentRoomId = roomId;
      currentUserId = userId;
      
      socket.join(roomId);
      
      const userColor = generateUserColor(userId);
      const userData = {
        userId,
        username,
        avatar,
        color: userColor,
        charCount: null,
        status: 'online'
      };

      await updateLeaderboard(roomId, userId, userData);
      
      const leaderboard = await getLeaderboard(roomId);
      
      // Notify others in the room
      socket.to(roomId).emit('room:user-joined', { userId, username, color: userColor });
      
      // Update everyone with the new leaderboard
      io.to(roomId).emit('room:leaderboard', leaderboard);
      
      console.log(`User ${userId} joined room ${roomId}`);
    });

    socket.on('room:submit-result', async ({ charCount }) => {
      if (!currentRoomId || !currentUserId) return;

      const key = `room:${currentRoomId}:users`;
      const userDataRaw = await require('../store/redis').redis.hget(key, currentUserId);
      
      if (userDataRaw) {
        const user = JSON.parse(userDataRaw);
        await updateLeaderboard(currentRoomId, currentUserId, {
          ...user,
          charCount
        });
        
        const updatedLeaderboard = await getLeaderboard(currentRoomId);
        
        io.to(currentRoomId).emit('room:submission', {
          userId: currentUserId,
          charCount
        });
        
        io.to(currentRoomId).emit('room:leaderboard', updatedLeaderboard);
      }
    });

    socket.on('room:language-change', ({ language }) => {
      if (!currentRoomId) return;
      socket.to(currentRoomId).emit('room:language-changed', { language, userId: currentUserId });
    });

    socket.on('disconnecting', async () => {
      if (currentRoomId && currentUserId) {
        await removeUserFromRoom(currentRoomId, currentUserId);
        const updatedLeaderboard = await getLeaderboard(currentRoomId);
        
        io.to(currentRoomId).emit('room:user-left', { userId: currentUserId });
        io.to(currentRoomId).emit('room:leaderboard', updatedLeaderboard);
        
        console.log(`User ${currentUserId} left room ${currentRoomId}`);
      }
    });
  });
};
