const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const WebSocket = require('ws');
const { createClient } = require('redis');
const promClient = require('prom-client');
const http = require('http');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3004;
const WS_PORT = process.env.WS_PORT || 8083; // Internal WS port, exposed via Traefik

// Middleware
app.use(cors());
app.use(express.json());

// Prometheus Metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'notification-service' });
});

// WebSocket Server
const server = http.createServer(app);
const wss = new WebSocket.Server({ server, path: '/ws' });

// Redis Subscriber
const redisSubscriber = createClient({
    url: process.env.REDIS_URL || 'redis://redis:6379'
});

redisSubscriber.on('error', (err) => console.log('Redis Client Error', err));

(async () => {
    await redisSubscriber.connect();

    // Subscribe to channels
    await redisSubscriber.subscribe('orders', (message) => {
        console.log(`Received message: ${message}`);
        // Broadcast to all connected clients
        wss.clients.forEach((client) => {
            if (client.readyState === WebSocket.OPEN) {
                client.send(message);
            }
        });
    });
    console.log('Subscribed to Redis channel: orders');
})();

wss.on('connection', (ws) => {
    console.log('New WebSocket connection');
    ws.send(JSON.stringify({ type: 'WELCOME', message: 'Connected to Notification Service' }));

    ws.on('message', (message) => {
        console.log(`Received: ${message}`);
    });
});

server.listen(PORT, () => {
    console.log(`Notification Service running on port ${PORT}`);
});
