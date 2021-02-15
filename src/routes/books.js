const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const Book = mongoose.model('Book');

/* GET users listing. */
router.get('/', async (req, res, next) => {
  

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
  const bookIds = req.body.ids;
  const loadQuery = bookIds ? { _id: { $in: bookIds } } : {};

  const condition = title ? {$or: [ {title: { $regex: title, $options: 'i' } } ]} : loadQuery;

  const books = await Book.find(condition, null, { skip, limit }).select(['title', 'categoryId', 'coverPath', 'rating']).sort({ title: 1 });

  res.send(books);
});

module.exports = router;
