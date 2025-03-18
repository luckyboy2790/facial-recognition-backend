const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');

const verifyToken = require('../middlewares/authJWT');

router.post('/create', verifyToken, createDepartment);
router.get('/', verifyToken, getDepartment);
router.post('/delete', verifyToken, deleteDepartment);

module.exports = router;
