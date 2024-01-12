const mongoose = require('mongoose');

const userCommentSchema = new mongoose.Schema({
  bookId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  comment: String,
  added: Number
});

mongoose.model('UserComment', userCommentSchema);
