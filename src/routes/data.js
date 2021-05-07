const express = require('express');
const { getBook, getBooksList, updateUserBook, getUserBooks } = require('../controllers/books');

const router = express.Router();

router.get('/book', getBook);
router.get('/booksList', getBooksList);
router.get('/getUserBooks', getUserBooks);
router.post('/updateUserBook', updateUserBook);

module.exports = router;
