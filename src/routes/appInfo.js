const express = require('express');
const { getAppInfo, getUnderConstruction } = require('../controllers/appInfo');

const router = express.Router();

router.get('/appInfo', getAppInfo);
router.get('/underConstruction', getUnderConstruction);

module.exports = router;
