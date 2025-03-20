const express = require('express');
const router = express.Router();
const { createEmployeeLeave } = require('../controllers/employeeLeave.controller');
const verifyToken = require('../middlewares/authJWT');

router.post('/personal/create_leave', verifyToken, createEmployeeLeave);

module.exports = router;
