const express = require('express');
const { getUserGoalItems, addUserGoalItem, deleteUserGoalItem, getUserGoalItemsByYear, addUserGoal, updateUserGoal } = require('../controllers/goals');
const { getUserGoalItemsValidator, addUserGoalItemValidator, getUserGoalItemsByYearValidator, deleteUserGoalItemValidator, addUserGoalValidator, updateUserGoalValidator } = require('../validators/goals');

const router = express.Router();

router.get('/userGoalItems', getUserGoalItemsValidator, getUserGoalItems);
router.get('/userGoalItemsByYear', getUserGoalItemsByYearValidator, getUserGoalItemsByYear);
router.post('/addUserGoalItem', addUserGoalItemValidator, addUserGoalItem);
router.post('/deleteUserGoalItem', deleteUserGoalItemValidator, deleteUserGoalItem);
router.post('/addUserGoal', addUserGoalValidator, addUserGoal);
router.post('/updateUserGoal', updateUserGoalValidator, updateUserGoal);

module.exports = router;
