const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const leaveTypeSchema = new Schema({
  leave_name: {
    type: String,
    required: [true, "Leave Name not provided"],
  },
  company: {
    type: Schema.Types.ObjectId,
    required: [true, "Company not provided"],
  },
});

module.exports = mongoose.model("LeaveType", leaveTypeSchema);
