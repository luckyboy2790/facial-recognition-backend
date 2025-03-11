const express = require('express');
const router = express.Router();
const { createSchedule, getSchedule } = require('../controllers/schedule.controller');

router.post('/create_schedule', createSchedule);
router.get('/get_schedule', getSchedule);

module.exports = router;
