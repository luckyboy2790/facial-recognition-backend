const express = require('express');
const router = express.Router();
const { createCompany, getCompany, deleteCompany } = require('../controllers/company.controller');

const verifyToken = require('../middlewares/authJWT');

router.post('/create', verifyToken, createCompany);
router.get('/', verifyToken, getCompany);
router.post('/delete', verifyToken, deleteCompany);

module.exports = router;
