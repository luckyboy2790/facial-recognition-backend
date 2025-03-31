const express = require("express");
const router = express.Router();
const {
  createAttendance,
  getAttendance,
  getAttendanceDetail,
  updateAttendance,
  deleteAttendance,
  checkOutAttendance,
  getPersonalAttendance,
  recordBreakTime,
  getTotalAttendance,
} = require("../controllers/attendance.controller");

const verifyToken = require("../middlewares/authJWT");

router.post("/create_attendance", createAttendance);
router.get("/get_attendance", verifyToken, getAttendance);
router.get("/get_attendance/:id", getAttendanceDetail);
router.post("/update_attendance/:id", updateAttendance);
router.post("/delete_attendance", deleteAttendance);
router.get("/checkout_attendance/:id", checkOutAttendance);
router.post("/record_break/:id", recordBreakTime);
router.get("/total_attendance", verifyToken, getTotalAttendance);

router.get("/personal/get_attendance", verifyToken, getPersonalAttendance);

module.exports = router;
