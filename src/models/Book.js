const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
  title: String,
  categoryPath: String,
  coverPath: String,
  authorsList: [String],
  annotation: String,
  pages: Number,
  votesCount: Number
});

mongoose.model('Book', bookSchema);
