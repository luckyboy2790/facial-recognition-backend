const express = require('express');
const router = express.Router();
const {
  createDepartment,
  getDepartment,
  deleteDepartment,
} = require('../controllers/department.controller');

router.post('/create', createDepartment);
router.get('/', getDepartment);
router.post('/delete', deleteDepartment);

module.exports = router;
