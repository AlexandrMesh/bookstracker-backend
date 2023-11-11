const mongoose = require('mongoose');

const App = mongoose.model('App');

const getAppInfo = async (req, res) => {
  try {
    try {
      const result = await App.find({}).select({ name: 1, description: 1, descriptionEn: 1, email: 1, version: 1 });
      const { name, description, descriptionEn, email, version } = result[0] || {};
      res.send({ name, description, descriptionEn, email, version });
    } catch (err) {
      return res.status(500).send({
        fieldName: 'other',
        key: 'somethingWentWrong',
        error: 'Something went wrong'
      });
    }
  } catch (err) {
    console.error(err);
  }
};

const getUnderConstruction = async (req, res) => {
  try {
    try {
      const result = await App.find({}).select({ underConstruction: 1, underConstructionEn: 1 });
      const { underConstruction, underConstructionEn } = result[0] || {};
      res.send({ underConstruction, underConstructionEn });
    } catch (err) {
      return res.status(500).send({
        fieldName: 'other',
        key: 'somethingWentWrong',
        error: 'Something went wrong'
      });
    }
  } catch (err) {
    console.error(err);
  }
};

module.exports = { getAppInfo, getUnderConstruction };
