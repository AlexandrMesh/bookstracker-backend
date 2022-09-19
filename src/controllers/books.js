const mongoose = require('mongoose');
const Book = mongoose.model('Book');
const User = mongoose.model('User');
const UserBook = mongoose.model('UserBook');

const getBook = async (req, res) => {
  const { userId, bookId } = req.query;

  if (!bookId) {
    return res.status(500).send('Must provide id');
  }

  try {
    const bookDetails = await Book.findById(bookId).lean();
    const book = await UserBook.findOne({ userId, bookId }) || {};
    console.log(bookDetails, 'bookDetails');
    if (book.bookStatus) {
      res.send({ ...bookDetails, status: book.bookStatus, added: book.added });
    } else {
      res.send(bookDetails);
    }
  } catch (err) {
    console.log(err, 'err');
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

const removeUserBook = async (bookId, userId) => {
  try {
    await User.updateOne(
      { _id: userId },
      { $pull: { 'usersBookList.planned': { id: bookId }, 'usersBookList.inProgress': { id: bookId }, 'usersBookList.completed': { id: bookId } } }
    );
    return { bookId };
  } catch (err) {
    console.log(err, 'removeUserBook err');
    console.log('Something went wrong');
  }
}

const addBookToList = async (bookId, userId, bookStatus) => {
  try {
    const currentDate = new Date();
    const timestamp = currentDate.getTime();
    const book = await Book.findById(bookId).select(['title', 'categoryId', 'coverPath', 'rating']).lean();
    const usersBook = { ...book, id: bookId, status: bookStatus, added: timestamp };
    const usersBookList = `usersBookList.${bookStatus}`;
    await User.updateOne(
      { _id: userId },
      { $addToSet: { [usersBookList]: usersBook } }
    );
    return usersBook;
  } catch (err) {
    console.log('Something went wrong');
  }
};

const updateUserBook = async (req, res) => {
  const { bookId, userId, bookStatus } = req.body;
  
  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  if (!bookId) {
    return res.status(500).send('Must provide book id');
  }

  try {
    const response = {};
    if (bookStatus === 'all') {
      await UserBook.remove({ bookId, userId });
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

    // const books = await removeUserBook(bookId, userId);
    // const data = bookStatus ? await addBookToList(bookId, userId, bookStatus) : books;
    res.send(response);
  } catch (err) {
    console.log(err, 'updateUserBook err');
    return res.status(500).send('Something went wrong');
  }
};

module.exports = { getBook, getBooksList, updateUserBook };
