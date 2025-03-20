const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const employeeLeaveSchema = new Schema({
  leaveType: {
    type: Schema.Types.ObjectId,
  },
  employee: {
    type: Schema.Types.ObjectId,
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
