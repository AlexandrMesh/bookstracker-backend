const mongoose = require('mongoose');

const appInfoSchema = new mongoose.Schema({
  name: String,
  version: String,
  description: String,
  descriptionEn: String,
  email: String,
  googlePlayUrl: String,
  underConstruction: String,
  underConstructionEn: String
});

mongoose.model('App', appInfoSchema);
