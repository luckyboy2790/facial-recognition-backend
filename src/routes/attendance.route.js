const express = require('express');
const router = express.Router();
const { createAttendance, getAttendance } = require('../controllers/attendance.controller');

router.post('/create_attendance', createAttendance);
router.get('/get_attendance', getAttendance);

module.exports = router;
