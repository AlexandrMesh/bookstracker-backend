const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const UserGoalItem = mongoose.model('UserGoalItem');
const UserGoal = mongoose.model('UserGoal');

const getUserGoalItems = async (req, res) => {
  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const result = await UserGoalItem.find({ userId }).select({ _id: 1, added_at: 1, pages: 1 });
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

const addUserGoalItem = async (req, res) => {
  const { pages, added_at } = req.body;

  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const userGoalItem = new UserGoalItem({ userId, pages, added_at });
      await userGoalItem.save();
      const result = await UserGoalItem.find({ userId }).select({ _id: 1, added_at: 1, pages: 1 });
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

const addUserGoal = async (req, res) => {
  const { numberOfPages } = req.body;

  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      await UserGoal.findOneAndUpdate({ userId }, { numberOfPages, added_at: timestamp }, { upsert: true }),
      res.send({ status: 'ok' });
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

const updateUserGoal = async (req, res) => {
  const { numberOfPages } = req.body;

  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      await UserGoal.findOneAndUpdate({ userId }, { numberOfPages }),
      res.send({ status: 'ok' });
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

module.exports = { getUserGoalItems, addUserGoalItem, addUserGoal, updateUserGoal };
