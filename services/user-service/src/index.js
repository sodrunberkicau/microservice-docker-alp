const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const userRoutes = require('./routes/userRoutes');
const promClient = require('prom-client');
const db = require('./config/database');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3003;

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
db.promise().query('SELECT 1')
    .then(() => console.log('Database connected successfully'))
    .catch(err => console.error('Database connection failed:', err));


// Routes
app.use('/', userRoutes);

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'user-service' });
});

app.listen(PORT, () => {
    console.log(`User Service running on port ${PORT}`);
});
