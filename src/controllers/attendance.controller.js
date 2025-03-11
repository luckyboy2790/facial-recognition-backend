const AttendanceModel = require('../models/attendance.model');
const EmployeeScheduleModel = require('../models/schedule.model');
const mongoose = require('mongoose');
const moment = require('moment');

exports.createAttendance = async (req, res) => {
  try {
    console.log(req.body);

    const { employee, date, time_in, time_out } = req.body;

    const existEmployee = await AttendanceModel.findOne({ employee: employee, date: date });

    if (existEmployee) {
      return res.status(400).json({
        message: `The employee already clocked in today at ${existEmployee.time_in}`,
      });
    }

    const employeeSchedule = await EmployeeScheduleModel.findOne({
      employee: employee,
      status: 'Present',
      from: { $lte: date },
      to: { $gte: date },
    });

    if (!employeeSchedule) {
      return res.status(400).json({
        message: 'No active schedule found for this employee.',
      });
    }

    const { start_time, off_time, rest_days } = employeeSchedule;

    if (rest_days.includes(date)) {
      return res.status(400).json({
        message: 'Today is a rest day for this employee.',
      });
    }

    const formattedTimeIn = time_in
      ? moment(`${date} ${time_in}`).format('YYYY-MM-DD hh:mm:ss A')
      : '';
    const formattedTimeOut = time_out
      ? moment(`${date} ${time_out}`).format('YYYY-MM-DD hh:mm:ss A')
      : '';

    let status_timein = '';
    if (time_in) {
      const timeInMoment = moment(`${date} ${time_in}`, 'YYYY-MM-DD HH:mm:ss');
      const startTimeMoment = moment(`${date} ${start_time}`, 'YYYY-MM-DD HH:mm:ss');

      if (timeInMoment.isAfter(startTimeMoment)) {
        status_timein = 'Late In';
      } else {
        status_timein = 'In Time';
      }
    }

    let status_timeout = '';
    if (time_out) {
      const timeOutMoment = moment(`${date} ${time_out}`, 'YYYY-MM-DD HH:mm:ss');
      const offTimeMoment = moment(`${date} ${off_time}`, 'YYYY-MM-DD HH:mm:ss');

      if (timeOutMoment.isBefore(offTimeMoment)) {
        status_timeout = 'Early Out';
      } else {
        status_timeout = 'On Time';
      }
    }

    let total_hours = '';
    if (time_in && time_out) {
      const timeInMoment = moment(`${date} ${time_in}`, 'YYYY-MM-DD HH:mm:ss');
      const timeOutMoment = moment(`${date} ${time_out}`, 'YYYY-MM-DD HH:mm:ss');

      const duration = moment.duration(timeOutMoment.diff(timeInMoment));
      const totalHours = duration.asMinutes() / 60;

      total_hours = totalHours.toFixed(1);
    }

    const newSchedule = new AttendanceModel({
      employee,
      date,
      time_in: formattedTimeIn,
      time_out: formattedTimeOut,
      total_hours,
      status_timein,
      status_timeout,
      reason: null,
      comment: null,
    });

    const scheduleId = await newSchedule.save();

    res.status(200).json({ message: 'Schedule created successfully', schedule: scheduleId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};
