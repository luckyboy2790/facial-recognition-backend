const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const userRoleSchema = new Schema({
  name: {
    type: String,
    required: [true, "Role Name not provided"],
  },
  status: {
    type: String,
    required: [true, "Role Status not provided"],
  },
  company: {
    type: Schema.Types.ObjectId,
    required: [true, "Company not provided"],
  },
  userType: {
    type: String,
    enum: ["admin", "employee"],
    default: "admin",
  },
  accessRight: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("UserRole", userRoleSchema);
