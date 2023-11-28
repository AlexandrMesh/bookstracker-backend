const { query } = require('express-validator');

const getCategoriesValidator = [
  query('language', 'Must be one of value: ru, en').isIn(['ru', 'en'])
];

module.exports = { getCategoriesValidator };