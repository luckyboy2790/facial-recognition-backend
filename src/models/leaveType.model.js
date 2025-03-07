const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const leaveTypeSchema = new Schema({
  leave_name: {
    type: String,
    required: [true, 'Leave Name not provided'],
  },
  credits: {
    type: String,
    required: [true, 'Credit not provided'],
  },
  percalendar: {
    type: String,
    required: [true, 'Term not provided'],
  },
});

module.exports = mongoose.model('LeaveType', leaveTypeSchema);
