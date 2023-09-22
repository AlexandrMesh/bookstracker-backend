const mongoose = require('mongoose');

const App = mongoose.model('App');

const getAppInfo = async (req, res) => {
  try {
    try {
      const result = await App.find({});
      const { name, version, description, email } = result[0] || {};
      res.send({ name, version, description, email });
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
