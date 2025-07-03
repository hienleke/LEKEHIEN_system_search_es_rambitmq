const amqp = require('amqplib');
const { Exchange, Queue } = require('../types/type');
let connection;
let channel;
async function initRabbitMQ(retries = 10, delay = 2000) {
    if (connection) return;

    const rabbitmqUrl = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

    for (let i = 1; i <= retries; i++) {
        try {
            connection = await amqp.connect(rabbitmqUrl);
            channel = await connection.createChannel();

            // Init default notification exchange
            await channel.assertExchange(Exchange.NOTIFICATION.NAME, Exchange.NOTIFICATION.TYPE, {
                durable: true,
            });

            // Init dead letter exchange
            await channel.assertExchange(
                Exchange.NOTIFICATION.DEAD_LETTER.NAME,
                Exchange.NOTIFICATION.DEAD_LETTER.TYPE,
                { durable: true }
            );

            await channel.assertQueue(Queue.NOTIFICATION.DEAD_LETTER, { durable: true });

            await channel.bindQueue(
                Queue.NOTIFICATION.DEAD_LETTER,
                Exchange.NOTIFICATION.DEAD_LETTER.NAME,
                Queue.NOTIFICATION.DEAD_LETTER
            );

            // Init default notification queue
            await channel.assertQueue(Queue.NOTIFICATION.SEARCH, {
                durable: true,
                arguments: {
                    'x-dead-letter-exchange': Exchange.NOTIFICATION.DEAD_LETTER.NAME,
                    'x-dead-letter-routing-key': Queue.NOTIFICATION.DEAD_LETTER,
                },
            });

            console.log(' RabbitMQ initialized successfully');
            break; // success, break retry loop

        } catch (err) {
            console.warn(`RabbitMQ connection failed (attempt ${i}/${retries}): ${err.message}`);
            if (i === retries) {
                console.error(' Failed to initialize RabbitMQ after maximum retries');
                throw err;
            }
            await new Promise(res => setTimeout(res, delay));
        }
    }
}


function getRabbitMQChannel() {
    if (!channel) throw new Error('RabbitMQ channel not initialized.');
    return channel;
}

async function consumeQueue(queue, options, handler) {
    if (!connection) {
        await initRabbitMQ();
    }
    const channel = getRabbitMQChannel();
    try {

        await channel.assertQueue(queue, options);
        await channel.prefetch(1);
        channel.consume(queue, async (msg) => {
            if (msg !== null) {
                try {
                    if (Math.random() < 0.5) {
                        throw new Error('Fake error for testing here');
                    }
                    await handler(msg.content.toString());
                    channel.ack(msg);
                } catch (err) {
                    console.error('Error processing message:', err.message);
                    channel.reject(msg, false);
                }

            }
        }, { noAck: false });
        console.log(`Consuming from queue: ${queue}`);
    } catch (error) {
        console.error('Error consuming queue:', error);
    }

}

module.exports = { initRabbitMQ, getRabbitMQChannel, consumeQueue }; 