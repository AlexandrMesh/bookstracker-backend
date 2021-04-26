const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = mongoose.model('Book');
const User = mongoose.model('User');

const getQuery = async (userId, bookListType, bookCategoryIds = [], title) => {
  const search = title ? {$or: [ {title: { $regex: title, $options: 'i' } } ]}: {};
  const user = userId ? await User.findById(userId) : {};
  const bookIds = (user[bookListType] || []).map((book) => book.id);
  if (user[bookListType]) {
    return { _id: { $in: bookIds } };
  } else {
    if (bookCategoryIds.length > 0) {
      return {...search, categoryId: { $in: bookCategoryIds } };
    }
    return {...search};
  }
};

/* GET users listing. */
router.get('/', async (req, res) => {
  

  // limit = 50
  // skip
  // page = 1,2,3,4,5

  // page 0
  // skip 0
  // limit 50

  // page 1
  // skip 50
  // limit 50

  // page 2
  // skip 100
  // limit 50

  // page * limit - limit -- if start page is 1
  // page * limit -- if start page is 0
  const limit = 5;
  const page = req.query.page || 0;
  const skip = page * limit;
  const title = req.query.title;
  const userId = req.query.userId;
  const bookListType = req.query.bookListType;
  const bookCategoryIds = req.query.bookCategoryIds && req.query.bookCategoryIds.length && req.query.bookCategoryIds.split(',');
  const { sortBy, sortDirection } = req.query.sortParams || { sortBy: 'title', sortDirection: 1 }; 

  const condition = await getQuery(userId, bookListType, bookCategoryIds, title);

  const books = await Book.find(condition, null, { skip, limit }).select(['title', 'categoryId', 'coverPath', 'rating']).sort({ [sortBy]: sortDirection });

  res.send(books);
});

module.exports = router;
