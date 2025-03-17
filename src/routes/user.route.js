const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/auth.controller.js');
const { createPermission } = require('../controllers/user.controller.js');

router.post('/register', signup);
router.post('/login', signin);

router.post('/create_permission', createPermission);
module.exports = router;
