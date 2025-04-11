const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const leaveGroupSchema = new Schema({
  group_name: {
    type: String,
    required: [true, "Group Name not provided"],
  },
  description: {
    type: String,
    required: [true, "Description not provided"],
  },
  company: {
    type: Schema.Types.ObjectId,
    required: [true, "Company not provided"],
  },
  leaveprivileges: {
    type: [Schema.Types.ObjectId],
    required: [true, "Leave Types not provided"],
  },
  status: {
    type: String,
    required: [true, "status not provided"],
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("LeaveGroup", leaveGroupSchema);
