const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const userSchema = new Schema({
  employee: {
    type: Schema.Types.ObjectId,
  },
  email: {
    type: String,
    required: [true, "Email not provided"],
  },
  account_type: {
    type: String,
  },
  role: {
    type: Schema.Types.ObjectId,
  },
  status: {
    type: String,
  },
  password: {
    type: String,
    required: [true, "Password not provided"],
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("User", userSchema);
