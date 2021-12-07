const mongoose = require('mongoose');
const Book = mongoose.model('Book');
const User = mongoose.model('User');

const getUserBooks = async (req, res) => {
  const { userId } = req.query;
  if (!userId) {
    return res.status(500).send('Must provide id');
  }

  try {
    const data = await User.findById(userId).select(['customPlannedBooks', 'customInProgressBooks', 'customCompletedBooks']);
    res.send(data);
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

const getBook = async (req, res) => {
  const { id } = req.query;
  if (!id) {
    return res.status(500).send('Must provide id');
  }

  try {
    const book = await Book.findById(id);
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

const removeUserBook = async (bookId, userId) => {
  try {
    const { customPlannedBooks, customInProgressBooks, customCompletedBooks } = await User.findOneAndUpdate(
      { _id: userId },
      { $pull: { customPlannedBooks: { id: bookId }, customInProgressBooks: { id: bookId }, customCompletedBooks: { id: bookId } } },
      { new: true }
    );
    return { customPlannedBooks, customInProgressBooks, customCompletedBooks};
  } catch (err) {
    console.log('Something went wrong');
  }
}

const addBookToList = async (bookId, userId, bookType) => {
  const currentDate = new Date();
  const timestamp = currentDate.getTime();

  const book = { id: bookId, createdDate: timestamp };

  try {
    const { customPlannedBooks, customInProgressBooks, customCompletedBooks } = await User.findOneAndUpdate(
      { _id: userId },
      { $addToSet: { [bookType]: book } },
      { new: true }
    );
    return { customPlannedBooks, customInProgressBooks, customCompletedBooks};
  } catch (err) {
    console.log('Something went wrong');
  }
};

const updateUserBook = async (req, res) => {
  const { bookId, userId, bookType } = req.body;
  
  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  if (!bookId) {
    return res.status(500).send('Must provide book id');
  }

  try {
    const books = await removeUserBook(bookId, userId);
    const data = bookType ? await addBookToList(bookId, userId, bookType) : books;
    res.send(data);
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

module.exports = { getBook, getBooksList, updateUserBook, getUserBooks };
