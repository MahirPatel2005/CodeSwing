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
    origin: '*',
    methods: ['GET', 'POST']
  }
});

// Presence Handler
require('./handlers/presenceHandler')(io);

// y-websocket setup
const wss = new WebSocket.Server({ noServer: true });

wss.on('connection', (ws, req) => {
  setupWSConnection(ws, req, { gc: true });
});

server.on('upgrade', (request, socket, head) => {
  const { pathname } = new URL(request.url, `http://${request.headers.host}`);

  if (pathname.startsWith('/realtime')) {
    wss.handleUpgrade(request, socket, head, (ws) => {
      wss.emit('connection', ws, request);
    });
  }
});

const PORT = process.env.PORT || 5001;
server.listen(PORT, () => {
  console.log(`Realtime server listening on port ${PORT}`);
});
