const { getElasticsearchClient } = require('../connections/elasticsearch');

let count = 0;
async function searchProducts(query, index) {
    const esClient = getElasticsearchClient();
    try {
        const esResult = await esClient.search({
            index,
            query: {
                bool: {
                    should: [
                        { match_phrase: { name: { query } } },
                        { match_phrase: { sku: { query } } },
                        { match_phrase: { description: query } }
                    ],
                    minimum_should_match: 1
                }
            },
            timeout: '4s',
            _source: ['name', 'sku', 'description']
        });
        const results = esResult.hits?.hits?.map(hit => hit._source) || [];
        console.log(`[searchProducts] ${query} Returning results:`, count++);
        return results;
    } catch (err) {
        console.log('[searchProducts] error:', err);
        return [];
    }
}

module.exports = { searchProducts }; 