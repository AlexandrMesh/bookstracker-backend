const express = require('express');
const { getBook, updateUserBook, getUserBookComment, deleteUserComment, updateBookVotes, updateUserBookAddedValue, updateUserComment, getBooksCountByYear } = require('../controllers/books');
const { getCoversList, addCustomBook } = require('../controllers/customBooks');
const { getBooksCountByYearValidator, deleteUserCommentValidator, getUserBookCommentValidator, getBookValidator, updateUserCommentValidator, getCoversListValidator, addCustomBookValidator, updateUserBookValidator, updateUserBookAddedValueValidator, updateBookVotesValidator } = require('../validators/data');

const router = express.Router();

router.get('/book', getBookValidator, getBook);
router.get('/userBookComment', getUserBookCommentValidator, getUserBookComment);
router.get('/coversList', getCoversListValidator, getCoversList);
router.get('/booksCountByYear', getBooksCountByYearValidator, getBooksCountByYear);
router.post('/addCustomBook', addCustomBookValidator, addCustomBook);
router.post('/updateUserBook', updateUserBookValidator, updateUserBook);
router.post('/updateBookVotes', updateBookVotesValidator, updateBookVotes);
router.post('/updateUserBookAddedValue', updateUserBookAddedValueValidator, updateUserBookAddedValue);
router.post('/updateUserComment', updateUserCommentValidator, updateUserComment);
router.post('/deleteUserComment', deleteUserCommentValidator, deleteUserComment);

module.exports = router;
