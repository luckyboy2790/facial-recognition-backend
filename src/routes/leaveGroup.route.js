const express = require('express');
const router = express.Router();
const {
  createLeaveGroup,
  getLeaveGroup,
  deleteLeaveGroup,
  updateLeaveGroup,
} = require('../controllers/leaveGroup.controller');

router.post('/create', createLeaveGroup);
router.get('/', getLeaveGroup);
router.post('/update', updateLeaveGroup);
router.post('/delete', deleteLeaveGroup);

module.exports = router;
