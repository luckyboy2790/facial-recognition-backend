const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const employeeLeaveSchema = new Schema({
  LeaveType: {
    type: String,
  },
  leaveFrom: {
    type: String,
  },
  leaveTo: {
    type: String,
  },
  leaveReturn: {
    type: String,
  },
  reason: {
    type: String,
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Declined'],
    default: 'Pending',
  },
  comment: {
    type: String,
  },
});

module.exports = mongoose.model('employeeLeave', employeeLeaveSchema);
