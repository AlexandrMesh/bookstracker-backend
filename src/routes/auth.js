const express = require('express');
const { checkAuth, signUp, signIn } = require('../controllers/auth');
const { checkAuthValidator, signUpValidator } = require('../validators/auth');

const router = express.Router();

router.get('/checkAuth', checkAuthValidator, checkAuth);

router.post('/signUp', signUpValidator, signUp);

router.post('/signIn', signIn);

module.exports = router;
