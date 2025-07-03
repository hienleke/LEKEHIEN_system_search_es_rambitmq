const { initElasticsearch } = require('./connections/elasticsearch');
const { initRabbitMQ } = require('./connections/rabbitmq');

// Initialize connections before app setup
initElasticsearch();
initRabbitMQ().catch(err => {
    console.error('Failed to initialize RabbitMQ:', err);
    process.exit(1);
});

const express = require('express');
const path = require('path');
const searchRoutes = require('./routes/searchRoutes');

const app = express();

app.use(express.json());

// Use search routes
app.use('/', searchRoutes);

module.exports = app; 