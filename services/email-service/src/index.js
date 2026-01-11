
require('dotenv').config();
const express = require('express');
const rabbitmq = require('./config/rabbitmq');
const { sendOrderEmail } = require('./emailService');

const app = express();
const PORT = process.env.PORT || 3005;

app.get('/health', (req, res) => {
    res.json({ status: 'UP', service: 'email-service' });
});

// Consume RabbitMQ messages
(async () => {
    await rabbitmq.connect();

    await rabbitmq.consume('order_created', async (order) => {
        console.log('Order created:', order);
        const userEmail = "sodrunberkicau@gmail.com";
        await sendOrderEmail(userEmail, order);
    });
})();


app.listen(PORT, () => console.log(`Email Service running on port ${PORT}`));
