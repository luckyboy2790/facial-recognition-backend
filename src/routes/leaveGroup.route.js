const express = require('express');
const router = express.Router();
const {
  createLeaveGroup,
  getLeaveGroup,
  deleteLeaveGroup,
  updateLeaveGroup,
} = require('../controllers/leaveGroup.controller');
const verifyToken = require('../middlewares/authJWT');

router.post('/create', verifyToken, createLeaveGroup);
router.get('/', verifyToken, getLeaveGroup);
router.post('/update', verifyToken, updateLeaveGroup);
router.post('/delete', verifyToken, deleteLeaveGroup);

module.exports = router;
