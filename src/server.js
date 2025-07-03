require('dotenv').config();
const cluster = require('cluster');
const os = require('os');
const app = require('./app');
const { initElasticsearch } = require('./connections/elasticsearch');
const { initRabbitMQ } = require('./connections/rabbitmq');


const PORT = process.env.PORT || 3000;
const numCPUs = process.env.CLUSTER_WORKERS ? parseInt(process.env.CLUSTER_WORKERS, 10) : os.cpus().length;

async function initAllConnections() {
    initElasticsearch();
    await initRabbitMQ();
}

if (cluster.isMaster) {
    console.log(`Master ${process.pid} is running`);
    for (let i = 0; i < numCPUs; i++) {
        cluster.fork();
    }
    cluster.on('exit', (worker, code, signal) => {
        console.log(`Worker ${worker.process.pid} died. Restarting...`);
        cluster.fork();
    });
} else {
    initAllConnections().then(() => {
        app.listen(PORT, () => {
            console.log(`Worker ${process.pid} started on port ${PORT}`);
        });
    }).catch((err) => {
        console.error('Failed to initialize connections:', err);
        process.exit(1);
    });
} 