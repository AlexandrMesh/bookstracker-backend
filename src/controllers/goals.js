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

const deleteUserGoalItem = async (req, res) => {
  const { id } = req.body;
  
  const userId = res.locals.userId;

  if (!userId) {
    return res.status(500).send('Must provide user id');
  }

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      await UserGoalItem.deleteOne({ _id: id, userId });
      const result = await UserGoalItem.find({ userId }).select({ _id: 1, added_at: 1, pages: 1 });
      return res.send(result);
    } catch (err) {
      return res.status(500).send('Something went wrong');
    }
  } else {
    res.send({ errors: result.array({ onlyFirstError: true }) });
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

module.exports = { getUserGoalItems, addUserGoalItem, deleteUserGoalItem, addUserGoal, updateUserGoal };
