const express = require("express");
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
  pinCheckOutAttendance,
} = require("../controllers/employee.controller");
const verifyToken = require("../middlewares/authJWT");

router.get("/total_field", verifyToken, getTotalFieldsData);
router.post("/create_employee", createEmployee);
router.get("/", verifyToken, getEmployee);
router.get("/total_employee", getTotalEmployee);
router.get("/total_employee_descriptor", getTotalEmployeeFaceInfo);
router.get("/:id", getEmployeeDetail);
router.post("/update_employee", updateEmployee);
router.post("/delete_employee", deleteEmployee);
router.post("/archive_employee", verifyToken, archiveEmployee);
router.post("/pin_checkout_employee", pinCheckOutAttendance);

module.exports = router;
