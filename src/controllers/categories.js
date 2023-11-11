const mongoose = require('mongoose');

const Category = mongoose.model('Category');

const getCategories = async (req, res) => {
  const { language } = req.query;

  try {
    try {
      const result = await Category.find({ language });
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
