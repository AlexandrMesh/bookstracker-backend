const express = require('express');
const { getUserGoalItems, addUserGoalItem, addUserGoal, updateUserGoal } = require('../controllers/goals');
const { getUserGoalItemsValidator, addUserGoalItemValidator, addUserGoalValidator, updateUserGoalValidator } = require('../validators/goals');

const router = express.Router();

router.get('/userGoalItems', getUserGoalItems, getUserGoalItemsValidator);
router.post('/addUserGoalItem', addUserGoalItem, addUserGoalItemValidator);
router.post('/addUserGoal', addUserGoal, addUserGoalValidator);
router.post('/updateUserGoal', updateUserGoal, updateUserGoalValidator);

module.exports = router;
