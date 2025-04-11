const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const settingSchema = new Schema({
  country: {
    type: String,
  },
  timezone: {
    type: String,
  },
  timeFormat: {
    type: String,
  },
  rfidClock: {
    type: Boolean,
    default: false,
  },
  ipRestriction: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Setting", settingSchema);
