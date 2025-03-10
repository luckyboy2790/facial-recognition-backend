const express = require('express');
const router = express.Router();
const {
  getTotalFieldsData,
  createEmployee,
  getEmployee,
  getEmployeeDetail,
} = require('../controllers/employee.controller');

router.get('/total_field', getTotalFieldsData);
router.post('/create_employee', createEmployee);
router.get('/', getEmployee);
router.get('/:id', getEmployeeDetail);

module.exports = router;
