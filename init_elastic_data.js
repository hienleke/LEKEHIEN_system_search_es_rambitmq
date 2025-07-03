require('dotenv').config();
const fs = require('fs');
const { Client } = require('@elastic/elasticsearch');

const products = JSON.parse(fs.readFileSync('products.json', 'utf8'));

const esUrl = process.env.ELASTICSEARCH_URL;
const esIndex = process.env.ELASTICSEARCH_INDEX;
const esApiKey = process.env.ELASTICSEARCH_API_KEY;
const esUsername = process.env.ELASTICSEARCH_USERNAME;
const esPassword = process.env.ELASTICSEARCH_PASSWORD;

const clientOptions = { node: esUrl };
if (esApiKey) {
    clientOptions.auth = { apiKey: esApiKey };
} else if (esUsername && esPassword) {
    clientOptions.auth = { username: esUsername, password: esPassword };
}

const client = new Client(clientOptions);

async function indexProducts() {
    for (const product of products) {
        product.sku = product.sku.toString();
        try {
            const res = await client.index({
                index: esIndex,
                document: product
            });
            console.log(`Indexed SKU: ${product.sku} - Result:`, res.result);
        } catch (err) {
            console.error(`Failed to index SKU: ${product.sku}`, err.meta ? err.meta.body : err);
        }
    }
    console.log('All products processed.');
}

indexProducts(); 