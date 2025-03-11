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

exports.getAttendance = async (req, res) => {
  try {
    console.log(req.query);

    const { pageIndex = '1', pageSize = '10', query = '', sort = {} } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    let dateFilter = {};

    if (query !== '') {
      try {
        const parsedDates = JSON.parse(query);
        if (Array.isArray(parsedDates) && parsedDates.length === 2) {
          const [startDate, endDate] = parsedDates.map((date) => moment(date).format('YYYY-MM-DD'));
          dateFilter = { date: { $gte: startDate, $lte: endDate } };
        }
      } catch (error) {
        console.error('Invalid query format:', error);
        return res.status(400).json({ message: 'Invalid date query format' });
      }
    }

    const pipeline = [
      {
        $match: dateFilter,
      },
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employeeData',
        },
      },
      {
        $unwind: { path: '$employeeData', preserveNullAndEmptyArrays: true },
      },
      {
        $project: {
          _id: 1,
          employee: 1,
          date: 1,
          total_hours: 1,
          status_timein: 1,
          status_timeout: 1,
          reason: 1,
          comment: 1,
          'employeeData.full_name': 1,
          time_in_24: {
            $cond: {
              if: { $or: [{ $eq: ['$time_in', ''] }, { $not: ['$time_in'] }] },
              then: null,
              else: { $dateToString: { format: '%H:%M:%S', date: { $toDate: '$time_in' } } },
            },
          },
          time_out_24: {
            $cond: {
              if: { $or: [{ $eq: ['$time_out', ''] }, { $not: ['$time_out'] }] },
              then: null,
              else: { $dateToString: { format: '%H:%M:%S', date: { $toDate: '$time_out' } } },
            },
          },
        },
      },
      {
        $sort: sort.key ? { [sort.key]: sort.order === 'asc' ? 1 : -1 } : { date: -1 },
      },
      {
        $facet: {
          metadata: [{ $count: 'totalRecords' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    let result = await AttendanceModel.aggregate(pipeline);

    let attendanceRecords = result[0].data;
    const totalRecords = result[0].metadata.length > 0 ? result[0].metadata[0].totalRecords : 0;

    attendanceRecords = attendanceRecords.map((record) => ({
      ...record,
      time_in: record.time_in_24
        ? moment(record.time_in_24, 'HH:mm:ss').format('hh:mm:ss A')
        : null,
      time_out: record.time_out_24
        ? moment(record.time_out_24, 'HH:mm:ss').format('hh:mm:ss A')
        : null,
    }));

    res.status(200).json({
      message: 'Attendance records fetched successfully',
      list: attendanceRecords,
      total: totalRecords,
    });
  } catch (error) {
    console.error('Error getting attendance records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
