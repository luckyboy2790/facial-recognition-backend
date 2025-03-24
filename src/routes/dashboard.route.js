const express = require("express");
const router = express.Router();
const {
  getDashboardDataByAdmin,
  getDashboardCardData,
} = require("../controllers/dashboard.controller");
const verifyToken = require("../middlewares/authJWT");

router.get("/admin/get_data", verifyToken, getDashboardDataByAdmin);
router.get("/admin/get_card_data", verifyToken, getDashboardCardData);

module.exports = router;
