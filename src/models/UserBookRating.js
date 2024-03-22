const mongoose = require('mongoose');

const userBookRatingSchema = new mongoose.Schema({
  bookId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  rating: Number,
  added: Number
});

mongoose.model('UserBookRating', userBookRatingSchema);
