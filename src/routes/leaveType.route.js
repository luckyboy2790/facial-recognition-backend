const express = require("express");
const router = express.Router();
const {
  createLeaveType,
  getLeaveType,
  deleteLeaveType,
} = require("../controllers/leaveType.controller");
const verifyToken = require("../middlewares/authJWT");

router.post("/create", verifyToken, createLeaveType);
router.get("/", verifyToken, getLeaveType);
router.post("/delete", verifyToken, deleteLeaveType);

module.exports = router;
