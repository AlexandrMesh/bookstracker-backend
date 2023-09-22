const mongoose = require('mongoose');

const Category = mongoose.model('Category');

const getCategories = async (req, res) => {
  try {
    try {
      const result = await Category.find({});
      res.send(result);
    } catch (err) {
      return res.status(500).send({
        fieldName: 'other',
        key: 'somethingWentWrong',
        error: 'Something went wrong'
      });
    }
  } catch (err) {
    console.error(err)
  }
};

module.exports = { getCategories };
