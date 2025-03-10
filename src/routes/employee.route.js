const express = require('express');
const router = express.Router();
const { getTotalFieldsData, createEmployee } = require('../controllers/employee.controller');

router.get('/total_field', getTotalFieldsData);
router.post('/create_employee', createEmployee);

module.exports = router;
