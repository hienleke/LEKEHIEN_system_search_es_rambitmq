const { searchProducts } = require('../services/elasticsearchService');
const { getRabbitMQChannel } = require('../connections/rabbitmq');
const { Queue } = require('../types/type');

// Handle search requests
async function searchProductsHandler(req, res) {
    const query = req.query.query;
    let results = [];
    if (query) {
        results = await searchProducts(query);
        // Publish to RabbitMQ
        try {
            const channel = getRabbitMQChannel();
            const payload = { query, results };
            channel.sendToQueue(Queue.NOTIFICATION.SEARCH, Buffer.from(JSON.stringify(payload)));
            console.log('[searchProductsHandler] Published to RabbitMQ:', payload);
        } catch (err) {
            console.error('[searchProductsHandler] Failed to publish to RabbitMQ:', err);
        }
    }
    res.json({ results });
}

module.exports = { searchProductsHandler }; 