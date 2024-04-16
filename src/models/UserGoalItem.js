const mongoose = require('mongoose');

const userGoalItemSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  added_at: Number,
  pages: Number
});

mongoose.model('UserGoalItem', userGoalItemSchema);
