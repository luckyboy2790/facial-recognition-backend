const express = require('express');
const { setSetting, getSetting } = require('../controllers/setting.controller');
const router = express.Router();
const verifyToken = require('../middlewares/authJWT');

router.post('/set_setting/:id', verifyToken, setSetting);
router.get('/get_setting', verifyToken, getSetting);

module.exports = router;
