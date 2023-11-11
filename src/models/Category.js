const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  path: String,
  value: String,
  language: String
});

mongoose.model('Category', categorySchema);
