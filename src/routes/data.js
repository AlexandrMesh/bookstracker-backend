const express = require('express');
const { getBook, updateUserBook, getUsersCompletedBooksCount, getUserBookComment, deleteUserComment, getBooksCountByYearV2, deleteUserBookRating, updateUserBookRating, getUserBookRating, updateBookVotes, updateUserBookAddedValue, updateUserComment, getBooksCountByYear } = require('../controllers/books');
const { getCoversList, addCustomBook } = require('../controllers/customBooks');
const { getBooksCountByYearValidator, getUserBookRatingValidator, getUsersCompletedBooksCountValidator, updateUserBookRatingValidator, deleteUserBookRatingValidator, deleteUserCommentValidator, getUserBookCommentValidator, getBookValidator, updateUserCommentValidator, getCoversListValidator, addCustomBookValidator, updateUserBookValidator, updateUserBookAddedValueValidator, updateBookVotesValidator } = require('../validators/data');

const router = express.Router();

router.get('/book', getBookValidator, getBook);
router.get('/userBookComment', getUserBookCommentValidator, getUserBookComment);
router.get('/userBookRating', getUserBookRatingValidator, getUserBookRating);
router.get('/coversList', getCoversListValidator, getCoversList);
router.get('/booksCountByYear', getBooksCountByYearValidator, getBooksCountByYear);
router.get('/booksCountByYearV2', getBooksCountByYearValidator, getBooksCountByYearV2);
router.get('/usersCompletedBooksCount', getUsersCompletedBooksCountValidator, getUsersCompletedBooksCount);
router.post('/addCustomBook', addCustomBookValidator, addCustomBook);
router.post('/updateUserBook', updateUserBookValidator, updateUserBook);
router.post('/updateBookVotes', updateBookVotesValidator, updateBookVotes);
router.post('/updateUserBookAddedValue', updateUserBookAddedValueValidator, updateUserBookAddedValue);
router.post('/updateUserComment', updateUserCommentValidator, updateUserComment);
router.post('/updateUserBookRating', updateUserBookRatingValidator, updateUserBookRating);
router.post('/deleteUserBookRating', deleteUserBookRatingValidator, deleteUserBookRating);
router.post('/deleteUserComment', deleteUserCommentValidator, deleteUserComment);

module.exports = router;
