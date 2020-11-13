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
  const page = req.body.page
  const skip = page * limit;
  
  const books = await Book.find({ $or: [ {title: /Двенадцать/i }, { year: 2001 } ] }, null, { skip, limit }).sort({ rating: -1 });
  res.send(books);
});

module.exports = router;