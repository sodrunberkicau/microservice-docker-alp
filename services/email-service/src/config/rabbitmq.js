const amqp = require('amqplib');

let channel;

async function connect() {
    try {
        const connection = await amqp.connect(process.env.RABBITMQ_URL || 'amqp://user:password@rabbitmq:5672');
        channel = await connection.createChannel();
        console.log('Connected to RabbitMQ');
        return channel;
    } catch (err) {
        console.error('Failed to connect to RabbitMQ', err);
    }
}

async function consume(queue, callback) {
    if (!channel) await connect();
    await channel.assertQueue(queue, { durable: true });
    channel.consume(queue, async (msg) => {
        if (msg !== null) {
            const data = JSON.parse(msg.content.toString());
            await callback(data);
            channel.ack(msg);
        }
    });
}

module.exports = { connect, consume };
