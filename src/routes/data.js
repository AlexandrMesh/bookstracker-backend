const express = require('express');
const { getBook, updateUserBook, updateBookVotes, updateUserBookAddedValue } = require('../controllers/books');
const { getCoversList, addCustomBook } = require('../controllers/customBooks');
const { getBookValidator, getCoversListValidator, addCustomBookValidator, updateUserBookValidator, updateUserBookAddedValueValidator, updateBookVotesValidator } = require('../validators/data');

const router = express.Router();

router.get('/book', getBookValidator, getBook);
router.get('/coversList', getCoversListValidator, getCoversList);
router.post('/addCustomBook', addCustomBookValidator, addCustomBook);
router.post('/updateUserBook', updateUserBookValidator, updateUserBook);
router.post('/updateBookVotes', updateBookVotesValidator, updateBookVotes);
router.post('/updateUserBookAddedValue', updateUserBookAddedValueValidator, updateUserBookAddedValue);


module.exports = router;
