const mongoose = require('mongoose');

const appInfoSchema = new mongoose.Schema({
  name: String,
  version: String,
  description: String,
  email: String,
  googlePlayUrl: String
});

mongoose.model('App', appInfoSchema);
