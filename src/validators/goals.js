const { query, body } = require('express-validator');

const getUserGoalItemsValidator = [];

const addUserGoalItemValidator = [
  body('pages', 'Min length: 1, Max length: 1000').isInt({ min: 1, max: 1000}),
  body('added_at', 'Must be an Unix time').isNumeric(),
  body('type', 'Must be one of value: daily, monthly').optional().isIn(['daily', 'monthly']),
];

const addUserGoalValidator = [
  body('numberOfPages', 'Min length: 5, Max length: 1000').isInt({ min: 5, max: 1000}),
  body('type', 'Must be one of value: daily, monthly').isIn(['daily', 'monthly']),
];

const updateUserGoalValidator = [
  body('numberOfPages', 'Min length: 5, Max length: 1000').isInt({ min: 5, max: 1000}),
  body('type', 'Must be one of value: daily, monthly').isIn(['daily', 'monthly']),
];

const deleteUserGoalItemValidator = [
  // body('id', 'Must be ObjectId').custom(value => ObjectId.isValid(value)),
];

const getUserGoalItemsByYearValidator = [
  query('language', 'Must be one of value: ru, en').isIn(['ru', 'en']),
];

module.exports = { getUserGoalItemsValidator, getUserGoalItemsByYearValidator, deleteUserGoalItemValidator ,addUserGoalItemValidator, addUserGoalValidator, updateUserGoalValidator };
