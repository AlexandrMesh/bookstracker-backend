const mongoose = require('mongoose');

const appInfoSchema = new mongoose.Schema({
  name: String,
  version: String,
  description: String,
  email: String
});

mongoose.model('App', appInfoSchema);
