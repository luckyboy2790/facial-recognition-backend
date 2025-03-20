const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getSchedule,
  getScheduleDetail,
  updateScheduleDetail,
  deleteSchedule,
  archiveSchedule,
  getPersonalSchedule,
} = require('../controllers/schedule.controller');
const verifyToken = require('../middlewares/authJWT');

router.post('/create_schedule', verifyToken, createSchedule);
router.get('/get_schedule', verifyToken, getSchedule);
router.get('/get_schedule/:id', verifyToken, getScheduleDetail);
router.post('/update_schedule/:id', verifyToken, updateScheduleDetail);
router.post('/delete_schedule', verifyToken, deleteSchedule);
router.post('/archive_schedule', verifyToken, archiveSchedule);

router.get('/personal/get_schedule', verifyToken, getPersonalSchedule);

module.exports = router;
