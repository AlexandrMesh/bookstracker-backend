const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  categoryId: Number,
  coverPath: String,
  authorsList: [String],
  annotation: String,
  pages: Number,
  votesCount: Number
});

mongoose.model('Book', bookSchema);
