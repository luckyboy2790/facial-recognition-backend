const express = require('express');
const router = express.Router();
const {
  getTotalFieldsData,
  createEmployee,
  getEmployee,
  getEmployeeDetail,
  updateEmployee,
} = require('../controllers/employee.controller');

router.get('/total_field', getTotalFieldsData);
router.post('/create_employee', createEmployee);
router.get('/', getEmployee);
router.get('/:id', getEmployeeDetail);
router.post('/update_employee', updateEmployee);

module.exports = router;
