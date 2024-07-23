const mongoose = require('mongoose');
const { validationResult } = require('express-validator');

const App = mongoose.model('App');
const User = mongoose.model('User');

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

const supportApp = async (req, res) => {
  const userId = res.locals.userId;
  const { confirmed } = req.body;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const currentDate = new Date();
      const viewedAt = currentDate.getTime();
      const supportApp = {
        confirmed,
        viewedAt,
      };
      const result = await User.findOneAndUpdate({ _id: userId }, { supportApp });
      res.send(result);
    } catch (err) {
      return res.status(500).send({
        fieldName: 'other',
        key: 'somethingWentWrong',
        error: 'Something went wrong'
      });
    }
  } else {
    return res.status(500).send({ errors: result.array({ onlyFirstError: true }) });
  }
};

module.exports = { getAppInfo, getUnderConstruction, supportApp };
