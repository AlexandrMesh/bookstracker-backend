const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const bcrypt = require('bcrypt');
const nodemailer = require("nodemailer");
const User = mongoose.model('User');

const router = express.Router();

router.post('/checkAuth', async (req, res) => {
  const { token } = req.body;

  jwt.verify(token, process.env.SECRET_KEY, async (err, payload) => {
    if (err) {
      return res.status(401).send({ error: 'Incorrect token!' });
    }

    const { userId } = payload;

    try {
      const { _id, email } = await User.findById(userId);
      res.send({ profile: { _id, email } });
    } catch (err) {
      return res.status(422).send(err.message);
    }
  });
});

router.post('/signUp', async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = new User({ email, password });
    await user.save();

    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    res.send({ token });
  } catch (err) {
    return res.status(422).send(err.message);
  }
});

router.post('/signIn', async (req, res) => {
  const { email, password, googleToken } = req.body;

  if (googleToken) {
    try {
      const { data : { email: googleEmail } } = await axios.post('https://oauth2.googleapis.com/tokeninfo', {
        id_token: googleToken
      });
      if (googleEmail !== email) {
        return res.status(401).send({ error: 'Invalid google email' });
      }
      const user = await User.findOne({ email });
      let userId;
      let profile;
      if (!user) {
        const newUser = new User({ email, password: googleToken });
        await newUser.save();
        userId = newUser._id;
        profile = { _id: newUser._id, email: newUser.email }
      } else {
        userId = user._id;
        profile = { _id: user._id, email: user.email }
      }
      const token = jwt.sign({ userId }, process.env.SECRET_KEY);
      return res.send({ token, profile });
      } catch (e) {
        return res.status(401).send({ error: 'Something went wrong' });
      }
  }

  if (!email || !password) {
    return res.status(401).send({ error: 'Must provide email and password' });
  }

  const user = await User.findOne({ email });
  if (!user) {
    return res.status(401).send({ error: 'Invalid password or email' });
  }

  try {
    await user.comparePassword(password);
    const token = jwt.sign({ userId: user._id }, process.env.SECRET_KEY);
    profile = { _id: user._id, email: user.email }
    return res.send({ token, profile });
  } catch (err) {
    return res.status(401).send({ error: 'Invalid password or email' });
  }
});

const sendEmail = async ({ email, code }) => {

  const transporter = nodemailer.createTransport({
    host: 'smtp.yandex.ru',
    port: 465,
    secure: true,
    auth: {
      user: 'eisven@yandex.ru',
      pass: 'passruchka',
    },
  });

  return await transporter.sendMail({
    from: '"Alex 👻" <eisven@yandex.ru>',
    to: email,
    subject: "Hello ✔",
    html: `<b>Your code: ${code}</b>`,
  });
}

router.post('/resetPassword', async (req, res) => {
  const { email } = req.body;

  if (!email) {
    return res.status(401).send({ error: 'Must provide email' });
  }

  const code = Math.round(Math.random()*1000000);

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
      return res.status(401).send({ error: 'User with this email is not exist' });
    }
    await sendEmail({ email, code })
    return res.send({ isSent: true });
  } catch (err) {
    return res.status(401).send({ isSent: false });
  }
});

router.get('/verifyResetPasswordCode', async (req, res) => {
  const { email, code } = req.body;

  if (!code) {
    return res.status(401).send({ error: 'Must provide code' });
  }

  const { resetPassword: { hashCode } } = await User.findOne({ email });

  if (hashCode) {
    const isCorrectCode = bcrypt.compareSync(code, hashCode);
    if (isCorrectCode) {
      const { resetPassword: { expire_timestamp, verified } } = await User.findOne({ email });
      if (verified) {
        return res.send({ error: 'Code is already verified' }); 
      }
      if (expire_timestamp > moment().unix()) {
        await User.findOneAndUpdate({ email }, { 'resetPassword.verified': true } );
        return res.send({ verified: true }); 
      } else {
        return res.send({ error: 'Code lifetime expired' }); 
      }
    } else {
      return res.send({ error: 'Incorrect code' }); 
    }
  } else {
    return res.status(401).send({ error: 'User has not hash code' });
  }
});

router.post('/setNewPassword', async (req, res) => {
  const { email, newPassword } = req.body;

  if (!email) {
    return res.status(401).send({ error: 'Must provide email' });
  }

  const { resetPassword: { verified } } = await User.findOne({ email });

  if (verified) {
    const password = bcrypt.hashSync(newPassword.toString(), 10);
    const passwordChanges = { $set: { password }, $unset: { resetPassword: '' } };
    await User.findOneAndUpdate({ email }, passwordChanges );
    return res.send({ isUpdated: 'Password successfully updated' });
  } else {
    return res.status(401).send({ error: 'User is not verified to change password' });
  }
});

module.exports = router;
