const {
  convertTo12HourFormat,
  formatDate,
} = require("../helper/employeeScheduleHelper");
const ScheduleModel = require("../models/schedule.model");
const mongoose = require("mongoose");

exports.createSchedule = async (req, res) => {
  try {
    console.log(req.body);

    const { employee, start_time, off_time, from, to, total_hours, rest_days } =
      req.body;

    const existEmployee = await ScheduleModel.findOne({
      employee: employee,
      status: "Present",
    });

    if (existEmployee) {
      res.status(400).json({
        message:
          "You can't create schedule for this employee because he has active schedule.",
      });

      return;
    }

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

    res
      .status(200)
      .json({ message: "Schedule created successfully", schedule: scheduleId });
  } catch (error) {
    console.error(error);

    res.status(500).json({ error: error.message });
  }
};

exports.getSchedule = async (req, res) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", sort = {} } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    let filterData = {};

    if (query) {
      filterData.$or = [
        { "employee_data.full_name": { $regex: query, $options: "i" } },
        { total_hours: { $regex: query, $options: "i" } },
        { rest_days: { $regex: query, $options: "i" } },
        { from: { $regex: query, $options: "i" } },
        { to: { $regex: query, $options: "i" } },
        { status: { $regex: query, $options: "i" } },
      ];
    }

    if (req.user.account_type === "Admin") {
      filterData["employee_data.company_id"] = req.user.employeeData.company_id;
    }

    const pipeline = [
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employee_data",
        },
      },
      { $unwind: { path: "$employee_data", preserveNullAndEmptyArrays: true } },
      {
        $match: filterData,
      },

      {
        $sort: sort.key
          ? { [sort.key]: sort.order === "asc" ? 1 : -1 }
          : { "employee_data.full_name": 1 },
      },

      {
        $facet: {
          metadata: [{ $count: "totalSchedules" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await ScheduleModel.aggregate(pipeline);
    let schedules = result[0].data;
    const totalSchedules =
      result[0].metadata.length > 0 ? result[0].metadata[0].totalSchedules : 0;

    schedules = schedules.map((schedule) => {
      return {
        ...schedule,
        employee_name: schedule.employee_data?.full_name || "Unknown",
        formattedTime: `${convertTo12HourFormat(
          schedule.start_time
        )} - ${convertTo12HourFormat(schedule.off_time)}`,
        formattedFromDate: formatDate(schedule.from),
        formattedToDate: formatDate(schedule.to),
      };
    });

    res.status(200).json({
      message: "Schedules fetched successfully",
      list: schedules,
      total: totalSchedules,
    });
  } catch (error) {
    console.error("Error getting schedules:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getScheduleDetail = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id);

    const schedule = await ScheduleModel.findById(id);

    res.status(200).json({
      message: "Schedule detail fetched successfully",
      schedule,
    });
  } catch (error) {
    console.error(error);
    res.status(200).json({ error: error.message });
  }
};

exports.updateScheduleDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const { employee, start_time, off_time, from, to, total_hours, rest_days } =
      req.body;

    console.log(req.body);

    const scheduleId = await ScheduleModel.findByIdAndUpdate(id, {
      employee,
      start_time,
      off_time,
      from,
      to,
      total_hours,
      rest_days,
    });

    res
      .status(200)
      .json({ message: "Schedule created successfully", schedule: scheduleId });
  } catch (error) {
    console.error(error);
    res.status(200).json({ error: error.message });
  }
};

exports.deleteSchedule = async (req, res) => {
  try {
    const data = req.body;

    for (let id of data.scheduleIds) {
      const schedule_id = await ScheduleModel.findByIdAndDelete(id);

      if (!schedule_id) {
        throw new Error("Delete failed");
      }
    }

    res.json({ message: "Delete Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.archiveSchedule = async (req, res) => {
  try {
    const { scheduleId } = req.body;

    if (!scheduleId) {
      return res.status(400).json({ error: "Schedule ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(scheduleId)) {
      return res.status(400).json({ error: "Invalid Schedule ID" });
    }

    const schedule = await ScheduleModel.findByIdAndUpdate(
      scheduleId,
      { status: "Previous" },
      { new: true, runValidators: true }
    );

    if (!schedule) {
      return res.status(404).json({ error: "Schedule not found" });
    }

    res.status(200).json({ schedule });
  } catch (error) {
    console.error("Error archiving schedule:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getPersonalSchedule = async (req, res) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", sort = {} } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    const currentDate = new Date();
    currentDate.setHours(0, 0, 0, 0);

    const employeeId = req.user.employee;

    const pipeline = [
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employee_data",
        },
      },
      { $unwind: { path: "$employee_data", preserveNullAndEmptyArrays: true } },
      {
        $match: {
          employee: employeeId,
          $or: [
            { "employee_data.full_name": { $regex: query, $options: "i" } },
            { total_hours: { $regex: query, $options: "i" } },
            { rest_days: { $regex: query, $options: "i" } },
            { from: { $regex: query, $options: "i" } },
            { to: { $regex: query, $options: "i" } },
            { status: { $regex: query, $options: "i" } },
          ],
        },
      },

      {
        $sort: sort.key
          ? { [sort.key]: sort.order === "asc" ? 1 : -1 }
          : { "employee_data.full_name": 1 },
      },

      {
        $facet: {
          metadata: [{ $count: "totalSchedules" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await ScheduleModel.aggregate(pipeline);
    let schedules = result[0].data;
    const totalSchedules =
      result[0].metadata.length > 0 ? result[0].metadata[0].totalSchedules : 0;

    schedules = schedules.map((schedule) => {
      return {
        ...schedule,
        employee_name: schedule.employee_data?.full_name || "Unknown",
        formattedTime: `${convertTo12HourFormat(
          schedule.start_time
        )} - ${convertTo12HourFormat(schedule.off_time)}`,
        formattedFromDate: formatDate(schedule.from),
        formattedToDate: formatDate(schedule.to),
      };
    });

    res.status(200).json({
      message: "Schedules fetched successfully",
      list: schedules,
      total: totalSchedules,
    });
  } catch (error) {
    console.error("Error getting schedules:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
