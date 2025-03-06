const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/auth.controller.js');

router.post('/register', signup);
router.post('/login', signin);
module.exports = router;
