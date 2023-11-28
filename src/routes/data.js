const express = require('express');
const { getBook, updateUserBook, updateBookVotes } = require('../controllers/books');
const { getCoversList, addCustomBook } = require('../controllers/customBooks');
const { getBookValidator, getCoversListValidator, addCustomBookValidator, updateUserBookValidator, updateBookVotesValidator } = require('../validators/data');

const router = express.Router();

router.get('/book', getBookValidator, getBook);
router.get('/coversList', getCoversListValidator, getCoversList);
router.post('/addCustomBook', addCustomBookValidator, addCustomBook);
router.post('/updateUserBook', updateUserBookValidator, updateUserBook);
router.post('/updateBookVotes', updateBookVotesValidator, updateBookVotes);

module.exports = router;
