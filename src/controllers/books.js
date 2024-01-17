const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const groupBy = require('lodash/groupBy');
const map = require('lodash/map');
const Book = mongoose.model('Book');
const CustomBook = mongoose.model('CustomBook');
const UserBook = mongoose.model('UserBook');
const UserVote = mongoose.model('UserVote');
const UserComment = mongoose.model('UserComment');

const getCountByYear = async (userId, boardType, language) => {
  try {
    const userBooks = await UserBook.aggregate([
      { $limit : 10000 },
      { $facet: {
        items: [
          { $lookup: { from: 'books', localField: 'bookId', foreignField: '_id', as: 'bookDetails' } },
          { $lookup: { from: 'custombooks', localField: 'bookId', foreignField: '_id', as: 'customBookDetails' } },
          { $match : { userId: new mongoose.Types.ObjectId(userId), bookStatus: boardType } },
          { $project: { customBookDetails: { language: 1 }, bookDetails: { language: 1 }, bookId: 1, added: 1, bookStatus: 1 } },
          { $replaceRoot: { newRoot: { $mergeObjects: [ { $arrayElemAt: [ "$bookDetails", 0 ] }, { $arrayElemAt: [ "$customBookDetails", 0 ] }, "$$ROOT" ] } } },
          { $project: { bookDetails: 0, customBookDetails: 0 } },
          { $match : { language } }
        ]
      }}
    ], { allowDiskUse : true });
    const booksCountByYear = map(
      groupBy(
        userBooks[0]?.items.map((item) => ({ ...item, year: new Date(item?.added)?.getFullYear() })),
        'year',
      ),
      (value, key) => {
        return {
          year: key,
          count: value.length,
        };
      },
    );
    return booksCountByYear;
  } catch (err) {
    return 'Something went wrong';
  }
}

const getBooksCountByYear = async (req, res) => {
  const { boardType, language } = req.query;

  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const result = await getCountByYear(userId, boardType, language);
      return res.send(result);
    } catch (error) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
  }
};


const getUserBookComment = async (req, res) => {
  const { bookId } = req.query;
  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const result = await UserComment.findOne({ userId, bookId }).select({ bookId: 1, comment: 1, added: 1 });
      return res.send(result);
    } catch (error) {
      console.log(error);
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
      const comment = await UserComment.findOne({ userId, bookId }).select({ comment: 1, added: 1 });
      if (book.bookStatus) {
        res.send({ ...bookDetails, bookStatus: book.bookStatus, added: book.added, ...(comment && { comment: comment.comment, commentAdded: comment.added })});
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
  const { bookId, date, language, boardType } = req.body;
  
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
      const countByYear = await getCountByYear(userId, boardType, language);
      return res.send({ added, countByYear });
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
  }
};

const updateUserBook = async (req, res) => {
  const { bookId, bookStatus, added, language, boardType } = req.body;
  
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
        const countByYear = await getCountByYear(userId, boardType, language);
        return res.send({ countByYear });
      } else {
        const data = await UserBook.findOneAndUpdate(
          { userId, bookId },
          { bookStatus, added: added || new Date().getTime() },
          { upsert: true, new: true }
        );
        response.bookStatus = data.bookStatus;
        response.added = data.added;
      }
      response.countByYear = await getCountByYear(userId, boardType, language);
      return res.send(response);
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
  }
};

const updateUserComment = async (req, res) => {
  const { bookId, added, comment } = req.body;
  
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const response = await UserComment.findOneAndUpdate(
        { userId, bookId },
        { comment, added },
        { upsert: true, new: true }
      ).select({ comment, added });;
      return res.send(response);
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
  }
};

const deleteUserComment = async (req, res) => {
  const { bookId } = req.body;
  
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      await UserComment.deleteOne({ bookId, userId });
      return res.send({ status: 'ok' });
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
  }
};

module.exports = { getBooksCountByYear, getBook, updateUserBook, deleteUserComment, getUserBookComment, updateUserComment, updateBookVotes, updateUserBookAddedValue };
