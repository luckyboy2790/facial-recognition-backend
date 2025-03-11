const { convertTo12HourFormat, formatDate } = require('../helper/employeeScheduleHelper');
const ScheduleModel = require('../models/schedule.model');

exports.createSchedule = async (req, res) => {
  try {
    console.log(req.body);

    const { employee, start_time, off_time, from, to, total_hours, rest_days } = req.body;

    const newSchedule = new ScheduleModel({
      employee,
      start_time,
      off_time,
      from,
      to,
      total_hours,
      rest_days,
    });

    const scheduleId = await newSchedule.save();

    res.status(200).json({ message: 'Schedule created successfully', schedule: scheduleId });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: error.message });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    console.log(req.query);

    const { pageIndex = 1, pageSize = 10, query = '', sort = {} } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const pipeline = [
      {
        $lookup: {
          from: 'employees',
          localField: 'employee',
          foreignField: '_id',
          as: 'employee_data',
        },
      },
      { $unwind: { path: '$employee_data', preserveNullAndEmptyArrays: true } },
      {
        $match: {
          $or: [
            { 'employee_data.full_name': { $regex: query, $options: 'i' } },
            { total_hours: { $regex: query, $options: 'i' } },
            { rest_days: { $regex: query, $options: 'i' } },
            { from: { $regex: query, $options: 'i' } },
            { to: { $regex: query, $options: 'i' } },
            { status: { $regex: query, $options: 'i' } },
          ],
        },
      },

      {
        $sort: sort.key
          ? { [sort.key]: sort.order === 'asc' ? 1 : -1 }
          : { 'employee_data.full_name': 1 },
      },

      {
        $facet: {
          metadata: [{ $count: 'totalSchedules' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await ScheduleModel.aggregate(pipeline);
    let schedules = result[0].data;
    const totalSchedules = result[0].metadata.length > 0 ? result[0].metadata[0].totalSchedules : 0;

    schedules = schedules.map((schedule) => {
      return {
        ...schedule,
        employee_name: schedule.employee_data?.full_name || 'Unknown',
        formattedTime: `${convertTo12HourFormat(schedule.start_time)} - ${convertTo12HourFormat(
          schedule.off_time,
        )}`,
        formattedFromDate: formatDate(schedule.from),
        formattedToDate: formatDate(schedule.to),
      };
    });

    res.status(200).json({
      message: 'Schedules fetched successfully',
      list: schedules,
      total: totalSchedules,
    });
  } catch (error) {
    console.error('Error getting schedules:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
