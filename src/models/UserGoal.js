const mongoose = require('mongoose');

const userGoalSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  added_at: Number,
  numberOfPages: Number,
  type: String,
});

mongoose.model('UserGoal', userGoalSchema);
