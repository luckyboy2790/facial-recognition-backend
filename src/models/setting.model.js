const mongoose = require('mongoose');
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
    default: false
  },
  timeInComments: {
    type: Boolean,
    default: false
  },
  ipRestriction: {
    type: String,
  },
});

module.exports = mongoose.model('Setting', settingSchema);
