const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/auth.controller.js');
const { createRole, getRole, updateRole } = require('../controllers/user.controller.js');

router.post('/register', signup);
router.post('/login', signin);

router.post('/create_role', createRole);
router.get('/get_role', getRole);
router.post('/update_role/:id', updateRole);
module.exports = router;
