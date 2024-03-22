const jwt = require('jsonwebtoken');
const mongoose = require('mongoose');
const User = mongoose.model('User');

module.exports = (req, res, next) => {
  const { authorization } = req.headers;
  // authorization === 'Bearer laksjdflaksdjasdfklj'

  if (!authorization) {
    return res.status(401).send({
        key: 'notLoggedIn',
        error: 'You must be logged in.'
      });
  }

  const token = authorization.replace('Bearer ', '');
  jwt.verify(token, 'I_LIKE_READING_BOOKS_209', async (err, payload) => {
    if (err) {
      return res.status(401).send({
        key: 'notLoggedIn',
        error: 'You must be logged in.'
      });
    }

    const { userId } = payload;

    res.locals.userId = userId;
    next();
  });
};
