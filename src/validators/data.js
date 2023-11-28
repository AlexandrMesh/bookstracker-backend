const mongoose = require('mongoose');
const { query, body } = require('express-validator');
const ObjectId = require('mongodb').ObjectId;
const Book = mongoose.model('Book');
const CustomBook = mongoose.model('CustomBook');

const getBookValidator = [
  query('bookId', 'Must be non-empty').notEmpty(),
  query('bookId', 'Must be ObjectId')
  .custom(value => ObjectId.isValid(value))
  .custom(async (value, { req }) => {
    const bookDetails = await Book.findById(value).lean() || await CustomBook.findById(value).lean();
    if (!bookDetails) {
      return Promise.reject('Book does not exist');
    }
    req.query.bookDetails = bookDetails;
  }),
];

const getCoversListValidator = [
  query(['bookName', 'language'], 'Must be non-empty').trim().notEmpty(),
  query('bookName', 'Min length: 3, Max length: 64').isLength({ min: 3, max: 64 }),
  query('language', 'Must be one of value: ru, en').isIn(['ru', 'en']),
  query('bookName', 'Must not contain: @^&/#+$~%;~`*<>=%[]{}_|').custom(value => !(/[@^&/\\#+$~%;~`*<>=%[\]{}_|]/g.test(value)))
];

const addCustomBookValidator = [
  body(['title', 'authorsList.*', 'categoryPath', 'coverPath', 'authorsList', 'annotation', 'pages', 'status', 'language'], 'Must be non-empty').notEmpty(),
  body(['title', 'authorsList.*', 'categoryPath', 'coverPath', 'annotation', 'status', 'language'], 'Must be a String').trim().isString(),
  body('language', 'Must be one of value: ru, en').isIn(['ru', 'en']),
  body(['title', 'authorsList.*', 'categoryPath', 'annotation', 'pages'], 'Must not contain: @^&/#+$~%;~`*<>=%[]{}_|').custom(value => !(/[@^&/\\#+$~%;~`*<>=%[\]{}_|]/g.test(value))),
  body('status', 'Must be one of value: all, planned, inProgress, completed').isIn(['all', 'planned', 'inProgress', 'completed']),
  body('title', 'Min length: 3, Max length: 64').isLength({ min: 3, max: 64 }),
  body('authorsList', 'Must contain min 1, max 3 authors').isArray({ min: 1, max: 3 }),
  body('authorsList.*', 'Min length: 6, Max length: 64').isLength({ min: 6, max: 64 }),
  body('categoryPath', 'Min length: 5, Max length: 10').isLength({ min: 5, max: 10 }),
  body('annotation', 'Min length: 100, Max length: 1000').isLength({ min: 100, max: 1000 }),
  body('pages', 'Min length: 2, Max length: 5').isLength({ min: 2, max: 5 }).isNumeric().withMessage('Must be a Number'),
  body('title').custom(async (value, { req }) => {
    const bookExists = await Book.findOne({ title: value, language: req.body.language }).collation( { locale: req.body.language, strength: 2 } );
    const customBookExists = await CustomBook.findOne({ title: value, language: req.body.language }).collation( { locale: req.body.language, strength: 2 } );
  
    if (bookExists || customBookExists) {
      return Promise.reject('Book exists');
    }
  }),
];

const updateUserBookValidator = [
  body(['bookId', 'bookStatus'], 'Must be non-empty').notEmpty(),
  body('bookId', 'Must be ObjectId').custom(value => ObjectId.isValid(value)),
  body('bookStatus', 'Must be one of value: all, planned, inProgress, completed').isIn(['all', 'planned', 'inProgress', 'completed'])
];

const updateBookVotesValidator = [
  body(['bookId', 'shouldAdd'], 'Must be non-empty').notEmpty(),
  body('shouldAdd', 'Must be a boolean').isBoolean(),
  body('bookId', 'Must be ObjectId').custom(value => ObjectId.isValid(value))
];

const getBooksValidator = [
  query('boardType', 'Must be one of value: all, planned, inProgress, completed').isIn(['all', 'planned', 'inProgress', 'completed']),
  query('language', 'Must be one of value: ru, en').isIn(['ru', 'en']),
  query('limit', 'Must equal 50').isIn([10, '10', '50', 50]),
  query('exact', 'Must be boolean').optional().isBoolean(),
  query(['title', 'sortType', 'sortDirection', 'categoryPaths.*'], 'Must not contain: @^&/#+$~%;~`*<>=%[]{}_|').optional().custom(value => !(/[@^&/\\#+$~%;~`*<>=%[\]{}_|]/g.test(value))),
  query('categoryPaths', 'Must be an array').optional().isArray(),
];

module.exports = { getBookValidator, getCoversListValidator, addCustomBookValidator, updateUserBookValidator, updateBookVotesValidator, getBooksValidator };