const express = require('express');
const { getBook, getBooksList, updateUserBook, updateBookVotes } = require('../controllers/books');

const router = express.Router();

router.get('/book', getBook);
router.get('/booksList', getBooksList);
router.post('/updateUserBook', updateUserBook);
router.post('/updateBookVotes', updateBookVotes);

module.exports = router;
