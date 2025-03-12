const express = require('express');
const router = express.Router();
const {
  getTotalFieldsData,
  createEmployee,
  getEmployee,
  getEmployeeDetail,
  updateEmployee,
  deleteEmployee,
  archiveEmployee,
  getTotalEmployee,
  getTotalEmployeeFaceInfo,
} = require('../controllers/employee.controller');

router.get('/total_field', getTotalFieldsData);
router.post('/create_employee', createEmployee);
router.get('/', getEmployee);
router.get('/total_employee', getTotalEmployee);
router.get('/total_employee_descriptor', getTotalEmployeeFaceInfo);
router.get('/:id', getEmployeeDetail);
router.post('/update_employee', updateEmployee);
router.post('/delete_employee', deleteEmployee);
router.post('/archive_employee', archiveEmployee);

module.exports = router;
