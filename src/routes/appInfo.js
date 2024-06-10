const express = require('express');
const { getAppInfo } = require('../controllers/appInfo');

const router = express.Router();

router.get('/appInfo', getAppInfo);

module.exports = router;
