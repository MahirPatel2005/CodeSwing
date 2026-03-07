const http = require('http');
const { Server } = require('socket.io');
const { setupWSConnection } = require('y-websocket/bin/utils');
const WebSocket = require('ws');
require('dotenv').config();

const server = http.createServer((req, res) => {
  res.writeHead(200, { 'Content-Type': 'text/plain' });
  res.end('Realtime Server Running\n');
});

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: '*', // Adjust to your frontend URL in production
    methods: ['GET', 'POST']
  }
});

io.on('connection', (socket) => {
  console.log('User connected via Socket.io:', socket.id);
  
  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// y-websocket setup
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', setupWSConnection);

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);

  if (pathname === '/realtime') {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Realtime server listening on port ${PORT}`);
});
