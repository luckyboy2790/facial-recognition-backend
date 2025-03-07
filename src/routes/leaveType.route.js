const express = require('express');
const router = express.Router();
const {
  createJobTitle,
  getJobTitle,
  deleteJobTitle,
} = require('../controllers/leaveType.controller');

router.post('/create', createJobTitle);
router.get('/', getJobTitle);
router.post('/delete', deleteJobTitle);

module.exports = router;
