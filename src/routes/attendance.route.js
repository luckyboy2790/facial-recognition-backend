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

router.post("/create_attendance", verifyToken, createAttendance);
router.get("/get_attendance", verifyToken, getAttendance);
router.get("/get_attendance/:id", verifyToken, getAttendanceDetail);
router.post("/update_attendance/:id", verifyToken, updateAttendance);
router.post("/delete_attendance", verifyToken, deleteAttendance);
router.get("/checkout_attendance/:id", verifyToken, checkOutAttendance);
router.post("/record_break/:id", verifyToken, recordBreakTime);
router.get("/total_attendance", verifyToken, getTotalAttendance);

router.get("/personal/get_attendance", verifyToken, getPersonalAttendance);

module.exports = router;
