const express = require('express');
const { getBook, getBooksList, addBookToList } = require('../controllers/books');

const router = express.Router();

router.get('/book', getBook);
router.get('/booksList', getBooksList);
router.post('/addBookToList', addBookToList);

module.exports = router;
