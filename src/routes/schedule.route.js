const express = require('express');
const router = express.Router();
const { createSchedule } = require('../controllers/schedule.controller');

router.post('/create_schedule', createSchedule);

module.exports = router;
