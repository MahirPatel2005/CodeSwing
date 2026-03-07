module.exports = (io) => {
  io.on('connection', (socket) => {
    console.log('Socket.io connection established in handler');
    // Add more socket event listeners here
  });
};
