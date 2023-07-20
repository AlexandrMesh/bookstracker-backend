const express = require('express');
const { getCategories } = require('../controllers/categories');

const router = express.Router();

router.get('/categories', getCategories);

module.exports = router;
