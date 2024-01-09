const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcrypt');
const { validationResult } = require('express-validator');
const { sendEmail } = require('../utils/sendEmail');
const { isValidEmail } = require('../utils/isValidEmail');

const User = mongoose.model('User');
const UserVote = mongoose.model('UserVote');
const App = mongoose.model('App');

const checkAuth = async (req, res) => {
  const { token } = req.query;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const { userId } = jwt.verify(token, process.env.SECRET_KEY);
      try {
        const currentDate = new Date();
        const lastLoggedIn = currentDate.getTime();
        const result = await Promise.all([
          App.find({}).select({ version: 1, googlePlayUrl: 1 }),
          User.findOneAndUpdate({ _id: userId }, { lastLoggedIn }),
          UserVote.find({ userId }).select({ bookId: 1, count: 1 })
        ]);
        const { version, googlePlayUrl } = result[0][0] || {};
        const { _id, email, registered, updated } = result[1] || {};
        const userVotes = result[2] || 0;

        res.send({ profile: { _id, email, registered, updated }, version, googlePlayUrl, userVotes });
      } catch (err) {
        return res.status(500).send({
          fieldName: 'other',
          key: 'somethingWentWrong',
          error: 'Something went wrong'
        });
      }
    } catch (err) {
      return res.status(500).send({
        fieldName: 'token',
        key: 'incorrectToken',
        error: 'Incorrect token!'
      });
    }
  } else {
    return res.status(500).send({ errors: result.array({ onlyFirstError: true }) });
  }
};

const signUp = async (req, res) => {
  const { email, password, language } = req.body;
  const lowerCasedEmail = email.toLowerCase();

  const result = validationResult(req);

  if (result.isEmpty()) {
    try {
    const existingUser = await User.findOne({ email: lowerCasedEmail });
    if (existingUser) {
      return res.status(500).send({
        fieldName: 'email',
        key: 'emailExists',
        error: 'Email is already taken'
      });
    }
    const currentDate = new Date();
    const registered = currentDate.getTime();

    const user = new User({ email: lowerCasedEmail, password, registered, language });
    await user.save();

    const appInfo = await App.find({});
    const { version, googlePlayUrl } = appInfo[0] || {};
    const profile = { _id: user._id, email: user.email, registered: user.registered }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    return res.send({ token, profile, version, googlePlayUrl });
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

const signIn = async (req, res) => {
  const { email, password, googleToken, language } = req.body;
  const lowerCasedEmail = email.toLowerCase();

  if (googleToken) {
    try {
      const { data: { email: googleEmail } } = await axios.post('https://oauth2.googleapis.com/tokeninfo', {
        id_token: googleToken
      });
      if (googleEmail.toLowerCase() !== lowerCasedEmail) {
        return res.status(500).send({
          fieldName: 'email',
          key: 'invalidGoogleEmail',
          error: 'Invalid google email'
        });
      }
      const user = await User.findOne({ email: lowerCasedEmail });
      let userId;
      let profile;
      const currentDate = new Date();
      const registered = currentDate.getTime();
      if (!user) {
        const newUser = new User({ email: lowerCasedEmail, password: googleToken, registered, language });
        await newUser.save();
        userId = newUser._id;
        profile = { _id: newUser._id, email: newUser.email, registered: newUser.registered }
      } else {
        userId = user._id;
        profile = { _id: user._id, email: user.email, registered: user.registered, updated: user.updated }
      }
      const token = jwt.sign({ userId }, process.env.SECRET_KEY);
      const userVotes = await UserVote.find({ userId }).select({ bookId: 1, count: 1 });
      const appInfo = await App.find({}).select({ version: 1, googlePlayUrl: 1 });
      const { version, googlePlayUrl } = appInfo[0] || {};
      return res.send({ token, profile, version, googlePlayUrl, userVotes });
    } catch (e) {
      return res.status(500).send({
        fieldName: 'other',
        key: 'somethingWentWrong',
        error: 'Something went wrong'
      });
    }
  }

  if (!lowerCasedEmail) {
    return res.status(500).send({
      fieldName: 'email',
      key: 'noEmail',
      error: 'Must provide email'
    });
  }

  if (!isValidEmail(lowerCasedEmail)) {
    return res.status(500).send({
      fieldName: 'email',
      key: 'incorrectEmail',
      error: 'Must provide correct email'
    });
  }

  if (!password) {
    return res.status(500).send({
      fieldName: 'password',
      key: 'noPassword',
      error: 'Must provide password'
    });
  }

  try {
    const user = await User.findOne({ email: lowerCasedEmail });
    if (!user) {
      return res.status(500).send({
        fieldName: 'email',
        key: 'noUser',
        error: 'No user with this email'
      });
    }
    await user.comparePassword(password);
    const userVotes = await UserVote.find({ userId: user._id }).select({ bookId: 1, count: 1 });
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    profile = { _id: user._id, email: user.email, registered: user.registered, updated: user.updated }
    const appInfo = await App.find({}).select({ version: 1, googlePlayUrl: 1 });
    const { version, googlePlayUrl } = appInfo[0] || {};
    return res.send({ token, profile, userVotes, version, googlePlayUrl });
  } catch (err) {
    console.log(err, 'err');
    return res.status(500).send({
      fieldName: 'password',
      key: 'wrongEmailOrPassword',
      error: 'Wrong email or password'
    });
  }
};

const resetPassword = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(500).send('Must provide email');
  }

  if (!isValidEmail(email)) {
    return res.status(500).send('Must provide correct email');
  }

  // Generate random six-digit number
  const code = Math.round(Math.random() * 1000000);

  const hashCode = bcrypt.hashSync(code.toString(), 10);

  const resetPassword = {
    hashCode,
    expire_timestamp: moment().add(5, 'minutes').unix(),
    created_timestamp: moment().unix(),
    verified: false
  };

  try {
    const user = await User.findOneAndUpdate({ email }, { resetPassword })
    if (!user) {
      return res.status(500).send('User with this email is not exist');
    }
    await sendEmail({ email, code });
    return res.send({ isSent: true });
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

const verifyResetPasswordCode = async (req, res) => {
  const { email, code } = req.body;

  if (!code) {
    return res.status(500).send('Must provide code');
  }

  if (!email) {
    return res.status(500).send('Must provide email');
  }

  if (!isValidEmail(email)) {
    return res.status(500).send('Must provide correct email');
  }

  try {
    const { resetPassword: { hashCode } } = await User.findOne({ email });

    if (hashCode) {
      const isCorrectCode = bcrypt.compareSync(code, hashCode);
      if (isCorrectCode) {
        const { resetPassword: { expire_timestamp, verified } } = await User.findOne({ email });
        if (verified) {
          return res.status(500).send('Code is already verified');
        }
        if (expire_timestamp > moment().unix()) {
          await User.findOneAndUpdate({ email }, { 'resetPassword.verified': true });
          return res.send({ verified: true });
        } else {
          return res.status(500).send('Code lifetime expired');
        }
      } else {
        return res.status(500).send('Incorrect code');
      }
    } else {
      return res.status(500).send('User has no hash code');
    }
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

const setNewPassword = async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email) {
    return res.status(500).send('Must provide email');
  }

  if (!isValidEmail(email)) {
    return res.status(500).send('Must provide correct email');
  }

  // password (min and max length)
  if (!newPassword) {
    return res.status(500).send('Must provide password');
  }

  try {
    const { resetPassword: { verified } } = await User.findOne({ email });

    if (verified) {
      const password = bcrypt.hashSync(newPassword.toString(), 10);
      const passwordChanges = { $set: { password }, $unset: { resetPassword: '' } };
      await User.findOneAndUpdate({ email }, passwordChanges);
      return res.send({ isUpdated: 'Password successfully updated' });
    } else {
      return res.status(500).send('User is not verified to change password');
    }
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }

};

module.exports = { checkAuth, signUp, signIn, resetPassword, verifyResetPasswordCode, setNewPassword };
