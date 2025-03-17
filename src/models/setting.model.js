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
  },
  timeInComments: {
    type: Boolean,
  },
  ipRestriction: {
    type: String,
  },
});

module.exports = mongoose.model('Setting', settingSchema);
