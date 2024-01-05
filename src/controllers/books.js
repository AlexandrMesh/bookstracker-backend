const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const groupBy = require('lodash/groupBy');
const map = require('lodash/map');
const Book = mongoose.model('Book');
const CustomBook = mongoose.model('CustomBook');
const UserBook = mongoose.model('UserBook');
const UserVote = mongoose.model('UserVote');

const getBooksCountByYear = async (req, res) => {
  const { boardType } = req.query;

  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const userBooks = await UserBook.find({ userId, bookStatus: boardType });
      const booksCountByYear = map(
        groupBy(
          userBooks.map((item) => ({ ...item, year: new Date(item?.added)?.getFullYear() })),
          'year',
        ),
        (value, key) => {
          return {
            year: key,
            count: value.length,
          };
        },
      );
      res.send(booksCountByYear);
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
  }
};

const getBook = async (req, res) => {
  const { bookId, bookDetails } = req.query;

  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const book = await UserBook.findOne({ userId, bookId }) || {};
      if (book.bookStatus) {
        res.send({ ...bookDetails, bookStatus: book.bookStatus, added: book.added });
      } else {
        res.send(bookDetails);
      }
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
  }
};

const updateBookVotes = async (req, res) => {
  const { bookId, shouldAdd } = req.body;
  
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      let updatedBook;
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      const userVote = await UserVote.findOne({ userId, bookId });
      if (!shouldAdd && !userVote || shouldAdd && userVote) {
        return res.status(500).send('Access denied');
      }
      if (shouldAdd && !userVote) {
        await UserVote.findOneAndUpdate(
          { userId, bookId },
          { added: timestamp, count: 1 },
          { upsert: true }
        );
        const book = await Book.findOneAndUpdate(
          { _id: bookId },
          {
            $inc: {
              votesCount: 1
            }
          },
          { new: true }
        ).select({ votesCount: 1 });
        const customBook = await CustomBook.findOneAndUpdate(
          { _id: bookId },
          {
            $inc: {
              votesCount: 1
            }
          },
          { new: true }
        ).select({ votesCount: 1 });
        updatedBook = book || customBook;
      } else if (!shouldAdd && userVote) {
        await UserVote.deleteOne({ bookId, userId });
        const book = await Book.findOneAndUpdate(
          { _id: bookId, votesCount: { $gte: 1 } },
          {
            $inc: {
              votesCount: -1
            }
          },
          { new: true }
        ).select({ votesCount: 1 });
        const customBook = await CustomBook.findOneAndUpdate(
          { _id: bookId, votesCount: { $gte: 1 } },
          {
            $inc: {
              votesCount: -1
            }
          },
          { new: true }
        ).select({ votesCount: 1 });
        updatedBook = book || customBook;
      }
      const userVotes = await UserVote.find({ userId }).select({ bookId: 1, count: 1 });
      return res.send({ votesCount: updatedBook?.votesCount || 0, userVotes });
    } catch (err) {
      console.log(err, 'err');
      return res.status(500).send('Something went wrong');
    }
  } else {
    return res.status(500).send({ errors: result.array({ onlyFirstError: true }) });
  }
};

const updateUserBookAddedValue = async (req, res) => {
  const { bookId, date } = req.body;
  
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const { added } = await UserBook.findOneAndUpdate(
        { userId, bookId },
        { added: date },
        { upsert: true, new: true }
      );
      return res.send({ added });
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
  }
};

const updateUserBook = async (req, res) => {
  const { bookId, bookStatus } = req.body;
  
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const response = {};
      if (bookStatus === 'all') {
        await UserBook.deleteOne({ bookId, userId });
        return res.send({ status: 'ok' });
      } else {
        const currentDate = new Date();
        const timestamp = currentDate.getTime();
        const data = await UserBook.findOneAndUpdate(
          { userId, bookId },
          { bookStatus, added: timestamp },
          { upsert: true, new: true }
        );
        response.bookStatus = data.bookStatus;
        response.added = data.added;
      }
      return res.send(response);
    } catch (err) {
      console.log(err, 'err');
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
  }

  
};

module.exports = { getBooksCountByYear, getBook, updateUserBook, updateBookVotes, updateUserBookAddedValue };
