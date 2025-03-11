const express = require('express');
const router = express.Router();
const {
  createSchedule,
  getSchedule,
  getScheduleDetail,
  updateScheduleDetail,
  deleteSchedule,
  archiveSchedule,
} = require('../controllers/schedule.controller');

router.post('/create_schedule', createSchedule);
router.get('/get_schedule', getSchedule);
router.get('/get_schedule/:id', getScheduleDetail);
router.post('/update_schedule/:id', updateScheduleDetail);
router.post('/delete_schedule', deleteSchedule);
router.post('/archive_schedule', archiveSchedule);

module.exports = router;
