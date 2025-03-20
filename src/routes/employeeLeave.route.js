const express = require('express');
const router = express.Router();
const {
  createEmployeeLeave,
  getPersonalEmployeeLeave,
  getPersonalEmployeeLeaveDetail,
  updateEmployeeLeave,
} = require('../controllers/employeeLeave.controller');
const verifyToken = require('../middlewares/authJWT');

router.post('/personal/create_leave', verifyToken, createEmployeeLeave);
router.get('/personal/get_personal_leaves', verifyToken, getPersonalEmployeeLeave);
router.get('/personal/get_personal_leave/:id', verifyToken, getPersonalEmployeeLeaveDetail);
router.post('/personal/update_leave/:id', verifyToken, updateEmployeeLeave);

module.exports = router;
