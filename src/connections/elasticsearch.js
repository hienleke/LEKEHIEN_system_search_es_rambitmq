const { Client } = require('@elastic/elasticsearch');

let esClient;

function getElasticsearchClient() {
    if (!esClient) throw new Error('Elasticsearch client not initialized.');
    return esClient;
}

function initElasticsearch() {
    const esUrl = process.env.ELASTICSEARCH_URL || 'http://localhost:9200';
    const esApiKey = process.env.ELASTICSEARCH_API_KEY;
    const esUsername = process.env.ELASTICSEARCH_USERNAME;
    const esPassword = process.env.ELASTICSEARCH_PASSWORD;

    const esClientOptions = { node: esUrl };
    if (esApiKey) {
        esClientOptions.auth = { apiKey: esApiKey };
    } else if (esUsername && esPassword) {
        esClientOptions.auth = { username: esUsername, password: esPassword };
    }
    esClient = new Client(esClientOptions);
}

module.exports = { getElasticsearchClient, initElasticsearch }; 