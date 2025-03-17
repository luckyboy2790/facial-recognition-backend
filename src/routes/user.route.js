const express = require('express');
const router = express.Router();
const { signup, signin } = require('../controllers/auth.controller.js');
const {
  createRole,
  getRole,
  updateRole,
  deleteRole,
  createUser,
  getUsers,
} = require('../controllers/user.controller.js');

router.post('/register', signup);
router.post('/login', signin);

router.post('/create_role', createRole);
router.get('/get_role', getRole);
router.post('/update_role/:id', updateRole);
router.post('/delete_role/:id', deleteRole);

router.post('/create_user', createUser);
router.get('/get_users', getUsers);

module.exports = router;
