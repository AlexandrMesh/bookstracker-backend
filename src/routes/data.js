const express = require('express');
const { getBook, getBooksList, updateUserBook } = require('../controllers/books');

const router = express.Router();

router.get('/book', getBook);
router.get('/booksList', getBooksList);
router.post('/updateUserBook', updateUserBook);

module.exports = router;
