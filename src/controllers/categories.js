const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const Category = mongoose.model('Category');

const getCategories = async (req, res) => {
  const { language } = req.query;

  const result = validationResult(req);
  if (result.isEmpty()) {
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
  } else {
    return res.status(500).send({ errors: result.array({ onlyFirstError: true }) });
  }
};

module.exports = { getCategories };
