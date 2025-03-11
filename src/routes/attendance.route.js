const express = require('express');
const router = express.Router();
const { createAttendance } = require('../controllers/attendance.controller');

router.post('/create_attendance', createAttendance);

module.exports = router;
