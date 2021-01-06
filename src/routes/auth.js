const express = require('express');
const { checkAuth, signUp, signIn, resetPassword, verifyResetPasswordCode, setNewPassword } = require('../controllers/auth');

const router = express.Router();

router.get('/checkAuth', checkAuth);

router.post('/signUp', signUp);

router.post('/signIn', signIn);

router.post('/resetPassword', resetPassword);

router.get('/verifyResetPasswordCode', verifyResetPasswordCode);

router.post('/setNewPassword', setNewPassword);

module.exports = router;
