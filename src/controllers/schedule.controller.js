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
