const express = require('express');
const { getBook, getBooksList, updateUserBook, updateBookVotes, addCustomBook } = require('../controllers/books');
const { getCoversList } = require('../controllers/customBooks');

const router = express.Router();

router.get('/book', getBook);
router.get('/booksList', getBooksList);
router.get('/coversList', getCoversList);
router.post('/addCustomBook', addCustomBook);
router.post('/updateUserBook', updateUserBook);
router.post('/updateBookVotes', updateBookVotes);

module.exports = router;
