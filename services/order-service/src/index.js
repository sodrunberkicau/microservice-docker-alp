const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const orderRoutes = require('./routes/orderRoutes');
const promClient = require('prom-client');
const db = require('./config/database');
const rabbitmq = require('./config/rabbmitmq');
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3002;


rabbitmq.connect();
// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));  // default 1mb -> naikkan sesuai ukuran base64
app.use(express.urlencoded({ limit: '10mb', extended: true }));

// Prometheus Metrics
const collectDefaultMetrics = promClient.collectDefaultMetrics;
collectDefaultMetrics({ register: promClient.register });

app.get('/metrics', async (req, res) => {
    res.set('Content-Type', promClient.register.contentType);
    res.end(await promClient.register.metrics());
});

// Database Connection Check
db.query('SELECT 1')
    .then(() => console.log('PostgreSQL Database connected successfully'))
    .catch(err => console.error('PostgreSQL Database connection failed:', err));

// Routes
app.use('/', orderRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'order-service' });
});

app.listen(PORT, () => {
    console.log(`Order Service running on port ${PORT}`);
});
