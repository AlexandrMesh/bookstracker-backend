const mongoose = require('mongoose');

const userBookSchema = new mongoose.Schema({
  bookId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  bookStatus: String,
  added: Number,
  bookDetails: {
    title: String,
    categoryPath: String,
    coverPath: String,
    authorsList: [String],
    annotation: String,
    isbn: String,
    pages: String,
    publisher: String,
    year: Number,
    votesCount: Number,
    rating: Number,
    added: Number,
    status: String
  }
});

mongoose.model('UserBook', userBookSchema);
