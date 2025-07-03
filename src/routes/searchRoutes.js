const express = require('express');
const { searchProductsHandler } = require('../controllers/searchController');

const router = express.Router();

router.get('/products/search', searchProductsHandler);

module.exports = router; 