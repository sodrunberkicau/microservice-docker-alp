const { Pool } = require('pg');
const dotenv = require('dotenv');

dotenv.config();

const pool = new Pool({
    host: process.env.DB_HOST || '103.150.117.221',
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || 'St4g1ngP0stgres@2023SqL!123@1',
    database: process.env.DB_NAME || 'slangtech',
    port: process.env.DB_PORT || 5432,
});

module.exports = pool;
