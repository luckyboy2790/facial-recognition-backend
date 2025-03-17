const express = require('express');
const { setSetting, getSetting } = require('../controllers/setting.controller');
const router = express.Router();

router.post('/set_setting/:id', setSetting);
router.get('/get_setting', getSetting);

module.exports = router;
