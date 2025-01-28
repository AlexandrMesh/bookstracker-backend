const mongoose = require('mongoose');
const { validationResult } = require('express-validator');
const groupBy = require('lodash/groupBy');
const map = require('lodash/map');
const UserGoalItem = mongoose.model('UserGoalItem');
const UserGoal = mongoose.model('UserGoal');

const getUserGoalItems = async (req, res) => {
  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      // Return only 300 last items
      const limit = 300;
      const result = await UserGoalItem.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $sort : { added_at: 1 } },
        { $limit : limit },
        { $project: { _id: 1, added_at: 1, pages: 1 } }
      ], { allowDiskUse: true });
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

const getUserGoalItemsByYear = async (req, res) => {
  const { language } = req.query;

  const userId = res.locals.userId;
  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const result = await UserGoalItem.aggregate([
        { $match: { userId: new mongoose.Types.ObjectId(userId) } },
        { $sort : { added_at: 1 } },
        { $project: { _id: 1, added_at: 1, pages: 1 } }
      ], { allowDiskUse: true });
      const countByYear = map(
        groupBy(
          result?.map((item) => ({ ...item, month: new Date(item?.added_at).getMonth() + 1, year: new Date(item?.added_at).getFullYear(), monthAndYear: new Date(item?.added_at)?.toLocaleString(language, { month: 'long', year: 'numeric' }) })),
          'monthAndYear',
        ),
        (value, key) => {
          return {
            monthAndYear: key,
            count: value.reduce((accumulator, value) => accumulator + value.pages, 0),
            month:  value[0]?.month,
            year: value[0]?.year
          };
        },
      );
      const monthInMiliseconds = 86400000 * 30;
      const yearInMiliseconds = 86400000 * 365;
      const currentDate = new Date();
      const addedTime = currentDate.getTime();
      const pagesReadPerMonth = result?.filter(({ added_at }) => added_at >= addedTime - monthInMiliseconds).reduce((accumulator, currentValue) => accumulator + currentValue.pages, 0) || 0;
      const pagesReadPerYear = result?.filter(({ added_at }) => added_at >= addedTime - yearInMiliseconds).reduce((accumulator, currentValue) => accumulator + currentValue.pages, 0) || 0;
      const response = {
        items: countByYear,
        pagesReadPerMonth,
        pagesReadPerYear
      };
      res.send(response);
    } catch (err) {
      console.log(err.message);
      return res.status(500).send({
        fieldName: 'other',
        key: 'somethingWentWrong',
        error: 'Something went wrong'
      });
    }
  } else {
    return res.status(500).send({ errors: result.array({ onlyFirstError: true }) });
  }
}

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
  const { numberOfPages, type } = req.body;

  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      const currentDate = new Date();
      const timestamp = currentDate.getTime();
      await UserGoal.findOneAndUpdate({ userId }, { numberOfPages, added_at: timestamp, type: type || 'daily' }, { upsert: true }),
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
  const { numberOfPages, type } = req.body;

  const userId = res.locals.userId;

  const result = validationResult(req);
  if (result.isEmpty()) {
    try {
      await UserGoal.findOneAndUpdate({ userId }, { numberOfPages, type }),
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

module.exports = { getUserGoalItems, getUserGoalItemsByYear, addUserGoalItem, deleteUserGoalItem, addUserGoal, updateUserGoal };
