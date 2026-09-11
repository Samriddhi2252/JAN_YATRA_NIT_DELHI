const express = require('express');
const http = require('http');
const WebSocket = require('ws');
const cors = require('cors');
require('dotenv').config();

const busesRouter = require('./routes/buses');
const bookingsRouter = require('./routes/bookings');
const smsRouter = require('./routes/sms');

const app = express();
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

app.use(cors());
app.use(express.json());

// API Route Handlers
app.use('/api/buses', busesRouter);
app.use('/api/bookings', bookingsRouter);
app.use('/api/sms', smsRouter);

// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'OK',
    system: 'JAN YATRA Transit Server',
    timestamp: new Date().toISOString(),
    liveMeshNodes: 18,
  });
});

// WebSocket real-time GPS telemetry broadcast loop
wss.on('connection', (ws) => {
  console.log('⚡ New Commuter/Driver client connected to telemetry feed');

  const interval = setInterval(() => {
    const busTelemetry = {
      type: 'GPS_PING',
      busId: 'BUS-100',
      speed: Math.floor(45 + Math.random() * 20),
      currentLocation: {
        lat: 28.6127 + (Math.random() - 0.5) * 0.002,
        lng: 77.2773 + (Math.random() - 0.5) * 0.002,
      },
      occupancy: 'HALF',
      timestamp: new Date().toISOString(),
    };

    if (ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify(busTelemetry));
    }
  }, 4000);

  ws.on('close', () => {
    clearInterval(interval);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 JAN YATRA Backend Server running on port ${PORT}`);
});
