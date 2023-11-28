const express = require('express');
const { getCategories } = require('../controllers/categories');
const { getCategoriesValidator } = require('../validators/categories');

const router = express.Router();

router.get('/categories', getCategoriesValidator, getCategories);

module.exports = router;
