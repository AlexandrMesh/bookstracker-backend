const express = require('express');
const mongoose = require('mongoose');
const axios = require('axios');
const jwt = require('jsonwebtoken');
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

module.exports = router;
