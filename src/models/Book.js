const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  categoryId: Number,
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
  bookStatus: String,
  bookDetails: {}
});

mongoose.model('Book', bookSchema);
