const mongoose = require('mongoose');

const appInfoSchema = new mongoose.Schema({
  name: String,
  description: String,
  descriptionEn: String,
  email: String
});

mongoose.model('App', appInfoSchema);
