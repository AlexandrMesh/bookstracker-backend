const mongoose = require('mongoose');
const Book = mongoose.model('Book');
const User = mongoose.model('User');

const getBook = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(500).send('Must provide id');
  }

  try {
    const book = await Book.findById(id).select(['title', 'categoryId']);
    res.send(book);
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

const getBooksList = async (req, res) => {
  const { ids } = req.body;
  if (ids || [].length === 0) {
    return res.status(500).send('Must provide ids');
  }

  try {
    const books = await Book.find({ _id: { $in: ids } });
    res.send(books);
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

const addBookToList = async (req, res) => {
  const { bookId, userId } = req.body;
  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  if (!bookId) {
    return res.status(500).send('Must provide book id');
  }

  try {
    const { plannedBookIds } = await User.findOneAndUpdate({ _id: userId }, { $addToSet: { plannedBookIds: bookId } });
    res.send(!plannedBookIds.includes(bookId));
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

module.exports = { getBook, getBooksList, addBookToList };
