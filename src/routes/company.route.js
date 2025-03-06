const express = require('express');
const router = express.Router();
const { createCompany, getCompany, deleteCompany } = require('../controllers/company.controller');

router.post('/create', createCompany);
router.get('/', getCompany);
router.post('/delete', deleteCompany);

module.exports = router;
