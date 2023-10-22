const mongoose = require('mongoose');

const userVoteSchema = new mongoose.Schema({
  bookId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  count: Number,
  added: Number
});

mongoose.model('UserVote', userVoteSchema);
