const express = require("express");
const router = express.Router();
const {
  getDashboardDataByAdmin,
  getDashboardCardData,
  getPersonalDashboardData,
  getPersonalDashboardCardData,
} = require("../controllers/dashboard.controller");
const verifyToken = require("../middlewares/authJWT");

router.get("/admin/get_data", verifyToken, getDashboardDataByAdmin);
router.get("/admin/get_card_data", verifyToken, getDashboardCardData);

router.get("/personal/get_data", verifyToken, getPersonalDashboardData);
router.get(
  "/personal/get_card_data",
  verifyToken,
  getPersonalDashboardCardData
);

module.exports = router;
