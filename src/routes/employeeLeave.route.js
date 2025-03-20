const express = require('express');
const router = express.Router();
const {
  createEmployeeLeave,
  getPersonalEmployeeLeave,
} = require('../controllers/employeeLeave.controller');
const verifyToken = require('../middlewares/authJWT');

router.post('/personal/create_leave', verifyToken, createEmployeeLeave);
router.get('/personal/get_personal_leaves', verifyToken, getPersonalEmployeeLeave);

module.exports = router;
