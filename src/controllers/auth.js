const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcrypt');
const { sendEmail } = require('../utils/sendEmail');
const { isValidEmail } = require('../utils/isValidEmail');

const User = mongoose.model('User');

const checkAuth = async (req, res) => {
  const { token } = req.query;
  if (!token) {
    return res.status(500).send('Must provide token');
  }

  jwt.verify(token, process.env.SECRET_KEY, async (err, payload) => {
    if (err) {
      return res.status(500).send('Incorrect token!');
    }

    const { userId } = payload;

    try {
      const { _id, email, registered, updated } = await User.findById(userId);
      res.send({ profile: { _id, email, registered, updated } });
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  });
};

const signUp = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(500).send('Must provide email');
  }

  if (!isValidEmail(email)) {
    return res.status(500).send('Must provide correct email');
  }

  //password (min and max length)
  if (!password) {
    return res.status(500).send('Must provide password');
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(500).send('Email is already taken');
    }

    const currentDate = new Date();
    const registered = currentDate.getTime();

    const user = new User({ email, password, registered });
    await user.save();

    const profile = { _id: user._id, email: user.email }
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    res.send({ token, profile });
  } catch (err) {
    return res.status(500).send('Something went wrong');
  }
};

const signIn = async (req, res) => {
  const { email, password, googleToken } = req.body;

  if (googleToken) {
    try {
      const { data: { email: googleEmail } } = await axios.post('https://oauth2.googleapis.com/tokeninfo', {
        id_token: googleToken
      });
      if (googleEmail !== email) {
        return res.status(401).send('Invalid google email');
      }
      const user = await User.findOne({ email });
      let userId;
      let profile;
      if (!user) {
        const newUser = new User({ email, password: googleToken });
        await newUser.save();
        userId = newUser._id;
        const currentDate = new Date();
        const registered = currentDate.getTime();
        profile = { _id: newUser._id, email: newUser.email, registered }
      } else {
        userId = user._id;
        profile = { _id: user._id, email: user.email, registered: user.registered, updated: user.updated }
      }
      const token = jwt.sign({ userId }, process.env.SECRET_KEY);
      return res.send({ token, profile });
    } catch (e) {
      return res.status(500).send('Something went wrong');
    }
  }

  if (!email) {
    return res.status(401).send('Must provide email');
  }

  if (!isValidEmail(email)) {
    return res.status(500).send('Must provide correct email');
  }

  if (!password) {
    return res.status(401).send('Must provide password');
  }

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).send('Invalid password or email');
    }
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    profile = { _id: user._id, email: user.email, registered: user.registered, updated: user.updated }
    return res.send({ token, profile });
  } catch (err) {
    return res.status(401).send('Something went wrong');
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
