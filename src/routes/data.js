const express = require('express');
const { getBook, getBooksList, updateUserBook, updateBookVotes } = require('../controllers/books');
const { getCoversList, addCustomBook } = require('../controllers/customBooks');

const router = express.Router();

router.get('/book', getBook);
router.get('/booksList', getBooksList);
router.get('/coversList', getCoversList);
router.post('/addCustomBook', addCustomBook);
router.post('/updateUserBook', updateUserBook);
router.post('/updateBookVotes', updateBookVotes);

module.exports = router;
