const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const productRoutes = require('./routes/productRoutes');
const promClient = require('prom-client');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

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

// Database Connection Check
db.query('SELECT 1')
    .then(() => console.log('PostgreSQL Database connected successfully'))
    .catch(err => console.error('PostgreSQL Database connection failed:', err));

// Routes
app.use('/', productRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'product-service' });
});

app.listen(PORT, () => {
    console.log(`Product Service running on port ${PORT}`);
});
