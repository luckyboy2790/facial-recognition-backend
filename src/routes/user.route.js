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
  getUserDetail,
  updateUserData,
  deleteUser,
} = require('../controllers/user.controller.js');
const verifyToken = require('../middlewares/authJWT');

router.post('/register', signup);
router.post('/login', signin);

router.post('/create_role', verifyToken, createRole);
router.get('/get_role', verifyToken, getRole);
router.post('/update_role/:id', verifyToken, updateRole);
router.post('/delete_role/:id', verifyToken, deleteRole);

router.post('/create_user', verifyToken, createUser);
router.get('/get_users', verifyToken, getUsers);
router.get('/get_user/:id', verifyToken, getUserDetail);
router.post('/update_user/:id', verifyToken, updateUserData);
router.post('/delete_user', verifyToken, deleteUser);

module.exports = router;
