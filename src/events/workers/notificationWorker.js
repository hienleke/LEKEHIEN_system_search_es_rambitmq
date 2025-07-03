const path = require('path');
const fs = require('fs');
const envPath = path.resolve(__dirname, '../../../.env');

if (!fs.existsSync(envPath)) {
    console.error(`[NotificationWorker] Lỗi: Tệp .env không tồn tại tại ${envPath}`);
    process.exit(1);
}

const dotenvResult = require('dotenv').config({ path: envPath });
if (dotenvResult.error) {
    console.error(`[NotificationWorker] Lỗi khi tải tệp .env:`, dotenvResult.error);
    process.exit(1);
}
const { consumeQueue } = require('../../connections/rabbitmq');
const { Queue, Exchange } = require('../../types/type');

async function handleNotification(message) {
    try {
        const { query, results } = JSON.parse(message);
        console.log(`[NotificationWorker] User searched for:`, query);
        console.log(`[NotificationWorker] Results:`, results);
        // Add notification logic here (e.g., send email, push notification, etc.)
    } catch (err) {
        console.error('[NotificationWorker] Failed to process message:', err, 'Raw:', message);
    }
}

async function main() {
    const queue = Queue.NOTIFICATION.SEARCH;
    console.log(`[NotificationWorker] Starting. Listening on queue: ${queue}`);
    await consumeQueue(queue, {
        durable: true,
        arguments: {
            'x-dead-letter-exchange': Exchange.NOTIFICATION.DEAD_LETTER.NAME,
            'x-dead-letter-routing-key': Queue.NOTIFICATION.DEAD_LETTER,
        },
    }, handleNotification);
}

if (require.main === module) {
    main();
}

// To run this worker:
// node src/events/workers/notificationWorker.js
// or set NOTIFICATION_QUEUE env variable 