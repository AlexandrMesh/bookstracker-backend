const { query, body } = require('express-validator');

const checkAuthValidator = [
  query('token', 'Must be JWT').isJWT()
];

const signUpValidator = [
  body(['email', 'password'], 'Must be non-empty').trim().notEmpty(),
  body('email', 'Must be correct email format').toLowerCase().isEmail(),
  body('password', 'Min length: 6, Max length: 64').isLength({ min: 6, max: 64 })
];

module.exports = { checkAuthValidator, signUpValidator };