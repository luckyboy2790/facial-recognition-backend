const EmployeeLeaveModel = require('../models/employeeLeave.model');

exports.createEmployeeLeave = async (req, res) => {
  try {
    const { leaveType, leaveFrom, leaveTo, leaveReturn, reason } = req.body;

    const newLeave = new EmployeeLeaveModel({
      LeaveType: leaveType,
      leaveFrom: leaveFrom,
      leaveTo: leaveTo,
      leaveReturn: leaveReturn,
      reason: reason,
    });

    const leaveId = await newLeave.save();

    res.json({ message: 'Create Success', job_title: leaveId });
  } catch (error) {
    console.log(error);
  }
};
