const { body } = require('express-validator');

const supportAppValidator = [
  body('confirmed', 'Must be a boolean').isBoolean()
];

module.exports = { supportAppValidator };