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
    type: String,
    required: [true, "Company not provided"],
  },
  accessRight: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
});

module.exports = mongoose.model("UserRole", userRoleSchema);
