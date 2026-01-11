const amqp = require('amqplib');

let channel;

async function connect() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672');
        channel = await connection.createChannel();
        await channel.assertQueue('order_created', { durable: true });
        console.log('Connected to RabbitMQ');
    } catch (err) {
        console.error('Failed to connect to RabbitMQ', err);
    }
}

function publishOrder(order) {
    if (!channel) {
        console.error('RabbitMQ channel is not established');
        return;
    }
    channel.sendToQueue('order_created', Buffer.from(JSON.stringify(order)), { persistent: true });
}

module.exports = { connect, publishOrder };
