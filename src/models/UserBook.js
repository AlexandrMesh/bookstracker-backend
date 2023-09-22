const mongoose = require('mongoose');

const userBookSchema = new mongoose.Schema({
  bookId: mongoose.Types.ObjectId,
  userId: mongoose.Types.ObjectId,
  bookStatus: String,
  added: Number
});

mongoose.model('UserBook', userBookSchema);
