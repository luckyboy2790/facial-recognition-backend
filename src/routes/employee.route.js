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
const verifyToken = require('../middlewares/authJWT');

router.get('/total_field', verifyToken, getTotalFieldsData);
router.post('/create_employee', verifyToken, createEmployee);
router.get('/', verifyToken, getEmployee);
router.get('/total_employee', verifyToken, getTotalEmployee);
router.get('/total_employee_descriptor', verifyToken, getTotalEmployeeFaceInfo);
router.get('/:id', verifyToken, getEmployeeDetail);
router.post('/update_employee', verifyToken, updateEmployee);
router.post('/delete_employee', verifyToken, deleteEmployee);
router.post('/archive_employee', verifyToken, archiveEmployee);

module.exports = router;
