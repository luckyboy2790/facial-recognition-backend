const express = require('express');
const router = express.Router();
const { getDashboardDataByAdmin } = require('../controllers/dashboard.controller');
const verifyToken = require('../middlewares/authJWT');

router.get('/admin/get_data', verifyToken, getDashboardDataByAdmin);

module.exports = router;
