const express = require('express');
const { getUserGoalItems, addUserGoalItem, deleteUserGoalItem, addUserGoal, updateUserGoal } = require('../controllers/goals');
const { getUserGoalItemsValidator, addUserGoalItemValidator, deleteUserGoalItemValidator, addUserGoalValidator, updateUserGoalValidator } = require('../validators/goals');

const router = express.Router();

router.get('/userGoalItems', getUserGoalItems, getUserGoalItemsValidator);
router.post('/addUserGoalItem', addUserGoalItem, addUserGoalItemValidator);
router.post('/deleteUserGoalItem', deleteUserGoalItem, deleteUserGoalItemValidator);
router.post('/addUserGoal', addUserGoal, addUserGoalValidator);
router.post('/updateUserGoal', updateUserGoal, updateUserGoalValidator);

module.exports = router;
