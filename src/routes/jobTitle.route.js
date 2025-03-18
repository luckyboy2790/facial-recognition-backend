const express = require('express');
const router = express.Router();
const {
  createJobTitle,
  getJobTitle,
  deleteJobTitle,
} = require('../controllers/jobTitle.controller');

const verifyToken = require('../middlewares/authJWT');

router.post('/create', verifyToken, createJobTitle);
router.get('/', verifyToken, getJobTitle);
router.post('/delete', verifyToken, deleteJobTitle);

module.exports = router;
