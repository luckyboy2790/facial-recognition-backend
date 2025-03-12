const express = require('express');
const router = express.Router();
const {
  createAttendance,
  getAttendance,
  getAttendanceDetail,
  updateAttendance,
  deleteAttendance,
} = require('../controllers/attendance.controller');

router.post('/create_attendance', createAttendance);
router.get('/get_attendance', getAttendance);
router.get('/get_attendance/:id', getAttendanceDetail);
router.post('/update_attendance/:id', updateAttendance);
router.post('/delete_attendance', deleteAttendance);

module.exports = router;
