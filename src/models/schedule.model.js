const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const scheduleModel = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
    required: [true, "Employee not provided"],
  },
  from: {
    type: String,
    required: [true, "From Date not provided"],
  },
  status: {
    type: String,
    required: [true, "Status not provided"],
    enum: ["Present", "Previous"],
    default: "Present",
  },
  to: {
    type: String,
    required: [true, "To Date not provided"],
  },
  start_time: {
    type: String,
    required: [true, "Start Time not provided"],
  },
  off_time: {
    type: String,
    required: [true, "Off Time not provided"],
  },
  total_hours: {
    type: String,
    required: [true, "Total Hours not provided"],
  },
  rest_days: {
    type: [String],
    required: [true, "Rest Days not provided"],
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("employeeSchedule", scheduleModel);
