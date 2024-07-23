const express = require('express');
const { getAppInfo, getUnderConstruction, supportApp } = require('../controllers/appInfo');
const { supportAppValidator } = require('../validators/app');

const router = express.Router();

router.get('/appInfo', getAppInfo);
router.get('/underConstruction', getUnderConstruction);
router.post('/supportApp', supportAppValidator, supportApp);

module.exports = router;
