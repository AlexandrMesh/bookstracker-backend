const mongoose = require('mongoose');

const userGoalSchema = new mongoose.Schema({
  userId: mongoose.Types.ObjectId,
  added_at: Number,
  numberOfPages: Number
});

mongoose.model('UserGoal', userGoalSchema);
