const { query, body } = require('express-validator');

const getUserGoalItemsValidator = [];

const addUserGoalItemValidator = [
  body('pages', 'Min length: 1, Max length: 1000').isInt({ min: 1, max: 1000}),
  body('added_at', 'Must be an Unix time').isNumeric()
];

const addUserGoalValidator = [
  body('numberOfPages', 'Min length: 5, Max length: 1000').isInt({ min: 5, max: 1000})
];

const updateUserGoalValidator = [
  body('numberOfPages', 'Min length: 5, Max length: 1000').isInt({ min: 5, max: 1000})
];

const deleteUserGoalItemValidator = [
  body('id', 'Must be ObjectId').custom(value => ObjectId.isValid(value)),
];

module.exports = { getUserGoalItemsValidator, deleteUserGoalItemValidator ,addUserGoalItemValidator, addUserGoalValidator, updateUserGoalValidator };
