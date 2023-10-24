const mongoose = require('mongoose');

const App = mongoose.model('App');

const getAppInfo = async (req, res) => {
  try {
    try {
      const result = await App.find({}).select({ name: 1, description: 1, email: 1, version: 1 });
      const { name, description, email, version } = result[0] || {};
      res.send({ name, description, email, version });
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

module.exports = { getAppInfo };
