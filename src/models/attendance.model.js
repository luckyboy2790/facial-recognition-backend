const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const attendanceModel = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    required: [true, "Employee not provided"],
  },
  date: {
    type: String,
  },
  time_in: {
    type: String,
  },
  time_out: {
    type: String,
  },
  break_in: {
    type: String,
  },
  break_out: {
    type: String,
  },
  total_hours: {
    type: String,
  },
  status_timein: {
    type: String,
    enum: ["", "Ok", "Late In", "In Time"],
    default: "",
  },
  status_timeout: {
    type: String,
    enum: ["", "Ok", "Early Out", "On Time"],
    default: "",
  },
  reason: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("employeeAttendance", attendanceModel);
