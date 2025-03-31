const AttendanceModel = require("../models/attendance.model");
const EmployeeScheduleModel = require("../models/schedule.model");
const moment = require("moment");

exports.createAttendance = async (req, res) => {
  try {
    const { employee, date, time_in, time_out, break_in, break_out } = req.body;

    console.log(time_in);

    const existEmployee = await AttendanceModel.findOne({
      employee: employee,
      date: date,
    });

    if (time_in === "") {
      return res.status(500).json({
        message: `You have to input time in.`,
      });
    }

    if (existEmployee) {
      return res.status(400).json({
        message: `The employee already clocked in today at ${existEmployee.time_in}`,
      });
    }

    const employeeSchedule = await EmployeeScheduleModel.findOne({
      employee: employee,
      status: "Present",
      from: { $lte: date },
      to: { $gte: date },
    });

    if (!employeeSchedule) {
      return res.status(400).json({
        message: "No active schedule found for this employee.",
      });
    }

    const { start_time, off_time, rest_days } = employeeSchedule;

    const dayName = moment(date, "YYYY-MM-DD").format("dddd");

    if (rest_days.includes(date)) {
      return res.status(400).json({
        message: "Today is a rest day for this employee.",
      });
    }

    if (rest_days.includes(dayName)) {
      return res.status(400).json({
        message: `This day (${dayName}) is a rest day for this employee.`,
      });
    }

    const formattedTimeIn = time_in
      ? moment(`${date} ${time_in}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";

    console.log(formattedTimeIn);

    const formattedTimeOut = time_out
      ? moment(`${date} ${time_out}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";

    const formattedBreakIn = break_in
      ? moment(`${date} ${break_in}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";

    const formattedBreakOut = break_out
      ? moment(`${date} ${break_out}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";

    let status_timein = "";
    if (time_in) {
      const timeInMoment = moment(`${date} ${time_in}`, "YYYY-MM-DD HH:mm:ss");
      const startTimeMoment = moment(
        `${date} ${start_time}`,
        "YYYY-MM-DD HH:mm:ss"
      );

      if (timeInMoment.isAfter(startTimeMoment)) {
        status_timein = "Late In";
      } else {
        status_timein = "In Time";
      }
    }

    let status_timeout = "";
    if (time_out) {
      const timeOutMoment = moment(
        `${date} ${time_out}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      const offTimeMoment = moment(
        `${date} ${off_time}`,
        "YYYY-MM-DD HH:mm:ss"
      );

      if (timeOutMoment.isBefore(offTimeMoment)) {
        status_timeout = "Early Out";
      } else {
        status_timeout = "On Time";
      }
    }

    let total_hours = "";
    if (time_in && time_out) {
      const timeInMoment = moment(`${date} ${time_in}`, "YYYY-MM-DD HH:mm:ss");
      const timeOutMoment = moment(
        `${date} ${time_out}`,
        "YYYY-MM-DD HH:mm:ss"
      );

      let totalHours =
        moment.duration(timeOutMoment.diff(timeInMoment)).asMinutes() / 60;

      if (break_in && break_out) {
        const breakInMoment = moment(
          `${date} ${break_in}`,
          "YYYY-MM-DD HH:mm:ss"
        );
        const breakOutMoment = moment(
          `${date} ${break_out}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        const breakDuration = moment.duration(
          breakOutMoment.diff(breakInMoment)
        );
        const breakHours = breakDuration.asMinutes() / 60;

        totalHours -= breakHours;
      }

      total_hours = totalHours.toFixed(1);
    }

    const newAttendance = new AttendanceModel({
      employee,
      date,
      time_in: formattedTimeIn,
      time_out: formattedTimeOut,
      break_in: formattedBreakIn,
      break_out: formattedBreakOut,
      total_hours,
      status_timein,
      status_timeout,
      reason: null,
      comment: null,
    });

    const attendanceId = await newAttendance.save();

    res.status(200).json({
      message: "Schedule created successfully",
      attendance: attendanceId,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getAttendance = async (req, res) => {
  try {
    const {
      pageIndex = "1",
      pageSize = "10",
      query = "",
      sort = {},
    } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    let dateFilter = {};

    if (query !== "") {
      try {
        const parsedDates = JSON.parse(query);
        if (Array.isArray(parsedDates) && parsedDates.length === 2) {
          const [startDate, endDate] = parsedDates.map((date) =>
            moment(date).format("YYYY-MM-DD")
          );
          dateFilter = { date: { $gte: startDate, $lte: endDate } };
        }
      } catch (error) {
        console.error("Invalid query format:", error);
        return res.status(400).json({ message: "Invalid date query format" });
      }
    }

    if (req.user.account_type === "Admin") {
      dateFilter["employeeData.company_id"] = req.user.employeeData.company_id;
    }

    const pipeline = [
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employeeData",
        },
      },
      {
        $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true },
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
          "employeeData.company_id": 1,
          "employeeData.full_name": 1,
          time_in_24: {
            $cond: {
              if: { $or: [{ $eq: ["$time_in", ""] }, { $not: ["$time_in"] }] },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$time_in" },
                },
              },
            },
          },
          time_out_24: {
            $cond: {
              if: {
                $or: [{ $eq: ["$time_out", ""] }, { $not: ["$time_out"] }],
              },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$time_out" },
                },
              },
            },
          },
          break_in_24: {
            $cond: {
              if: {
                $or: [{ $eq: ["$break_in", ""] }, { $not: ["$break_in"] }],
              },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$break_in" },
                },
              },
            },
          },
          break_out_24: {
            $cond: {
              if: {
                $or: [{ $eq: ["$break_out", ""] }, { $not: ["$break_out"] }],
              },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$break_out" },
                },
              },
            },
          },
        },
      },
      {
        $match: dateFilter,
      },
      {
        $sort: sort.key
          ? { [sort.key]: sort.order === "asc" ? 1 : -1 }
          : { date: -1 },
      },
      {
        $facet: {
          metadata: [{ $count: "totalRecords" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    let result = await AttendanceModel.aggregate(pipeline);

    let attendanceRecords = result[0].data;
    const totalRecords =
      result[0].metadata.length > 0 ? result[0].metadata[0].totalRecords : 0;

    attendanceRecords = attendanceRecords.map((record) => ({
      ...record,
      time_in: record.time_in_24
        ? moment(record.time_in_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
      time_out: record.time_out_24
        ? moment(record.time_out_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
      break_in: record.break_in_24
        ? moment(record.break_in_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
      break_out: record.break_out_24
        ? moment(record.break_out_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
    }));

    res.status(200).json({
      message: "Attendance records fetched successfully",
      list: attendanceRecords,
      total: totalRecords,
    });
  } catch (error) {
    console.error("Error getting attendance records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getAttendanceDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const attendance = await AttendanceModel.findById(id);

    res.status(200).json({
      message: "Attendance detail fetched successfully",
      attendance,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const existAttendance = await AttendanceModel.findById(id);

    if (!existAttendance) {
      return res.status(404).json({
        message: "There is no attendance data for this employee.",
      });
    }

    const { employee, date, time_in, time_out, reason, break_in, break_out } =
      req.body;

    if (time_in === "") {
      return res.status(500).json({
        message: `You have to input time in.`,
      });
    }

    const employeeSchedule = await EmployeeScheduleModel.findOne({
      employee: employee,
      status: "Present",
      from: { $lte: date },
      to: { $gte: date },
    });

    if (!employeeSchedule) {
      return res.status(400).json({
        message: "No active schedule found for this employee.",
      });
    }

    const { start_time, off_time, rest_days } = employeeSchedule;

    const dayName = moment(date, "YYYY-MM-DD").format("dddd");

    if (rest_days.includes(date)) {
      return res.status(400).json({
        message: "Today is a rest day for this employee.",
      });
    }

    if (rest_days.includes(dayName)) {
      return res.status(400).json({
        message: `This day (${dayName}) is a rest day for this employee.`,
      });
    }

    const formattedTimeIn = time_in
      ? moment(`${date} ${time_in}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";
    const formattedTimeOut = time_out
      ? moment(`${date} ${time_out}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";
    const formattedBreakIn = break_in
      ? moment(`${date} ${break_in}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";
    const formattedBreakOut = break_out
      ? moment(`${date} ${break_out}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";

    let status_timein = "";
    if (time_in) {
      const timeInMoment = moment(`${date} ${time_in}`, "YYYY-MM-DD HH:mm:ss");
      const startTimeMoment = moment(
        `${date} ${start_time}`,
        "YYYY-MM-DD HH:mm:ss"
      );

      if (timeInMoment.isAfter(startTimeMoment)) {
        status_timein = "Late In";
      } else {
        status_timein = "In Time";
      }
    }

    let status_timeout = "";
    if (time_out) {
      const timeOutMoment = moment(
        `${date} ${time_out}`,
        "YYYY-MM-DD HH:mm:ss"
      );
      const offTimeMoment = moment(
        `${date} ${off_time}`,
        "YYYY-MM-DD HH:mm:ss"
      );

      if (timeOutMoment.isBefore(offTimeMoment)) {
        status_timeout = "Early Out";
      } else {
        status_timeout = "On Time";
      }
    }

    let total_hours = "";
    if (time_in && time_out) {
      const timeInMoment = moment(`${date} ${time_in}`, "YYYY-MM-DD HH:mm:ss");
      const timeOutMoment = moment(
        `${date} ${time_out}`,
        "YYYY-MM-DD HH:mm:ss"
      );

      let totalHours =
        moment.duration(timeOutMoment.diff(timeInMoment)).asMinutes() / 60;

      if (break_in && break_out) {
        const breakInMoment = moment(
          `${date} ${break_in}`,
          "YYYY-MM-DD HH:mm:ss"
        );
        const breakOutMoment = moment(
          `${date} ${break_out}`,
          "YYYY-MM-DD HH:mm:ss"
        );

        const breakDuration = moment.duration(
          breakOutMoment.diff(breakInMoment)
        );
        const breakHours = breakDuration.asMinutes() / 60;

        totalHours -= breakHours;
      }

      total_hours = totalHours.toFixed(1);
    }

    const scheduleId = await AttendanceModel.findByIdAndUpdate(id, {
      employee,
      date,
      time_in: formattedTimeIn,
      time_out: formattedTimeOut,
      break_in: formattedBreakIn,
      break_out: formattedBreakOut,
      total_hours,
      status_timein,
      status_timeout,
      reason: reason,
      comment: null,
    });

    res
      .status(200)
      .json({ message: "Schedule created successfully", schedule: scheduleId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteAttendance = async (req, res) => {
  try {
    const data = req.body;

    for (let id of data.attendanceIds) {
      const schedule_id = await AttendanceModel.findByIdAndDelete(id);

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

exports.checkOutAttendance = async (req, res) => {
  try {
    const { id } = req.params;

    const now = new Date();

    const date = now.toISOString().split("T")[0];

    const attendanceData = await AttendanceModel.findOne({
      employee: id,
      date,
    });

    if (!attendanceData || attendanceData?.length <= 0) {
      return res
        .status(400)
        .send({ message: "There is no attendance data for this employee." });
    }

    res.status(200).send(attendanceData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getPersonalAttendance = async (req, res) => {
  try {
    const {
      pageIndex = "1",
      pageSize = "10",
      query = "",
      sort = {},
    } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    let dateFilter = {};

    if (query !== "") {
      try {
        const parsedDates = JSON.parse(query);
        if (Array.isArray(parsedDates) && parsedDates.length === 2) {
          const [startDate, endDate] = parsedDates.map((date) =>
            moment(date).format("YYYY-MM-DD")
          );
          dateFilter = { date: { $gte: startDate, $lte: endDate } };
        }
      } catch (error) {
        console.error("Invalid query format:", error);
        return res.status(400).json({ message: "Invalid date query format" });
      }
    }

    const employeeId = req.user.employee;

    dateFilter.employee = employeeId;

    const pipeline = [
      {
        $match: dateFilter,
      },
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employeeData",
        },
      },
      {
        $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true },
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
          "employeeData.full_name": 1,
          time_in_24: {
            $cond: {
              if: { $or: [{ $eq: ["$time_in", ""] }, { $not: ["$time_in"] }] },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$time_in" },
                },
              },
            },
          },
          time_out_24: {
            $cond: {
              if: {
                $or: [{ $eq: ["$time_out", ""] }, { $not: ["$time_out"] }],
              },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$time_out" },
                },
              },
            },
          },
          break_in_24: {
            $cond: {
              if: {
                $or: [{ $eq: ["$break_in", ""] }, { $not: ["$break_in"] }],
              },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$break_in" },
                },
              },
            },
          },
          break_out_24: {
            $cond: {
              if: {
                $or: [{ $eq: ["$break_out", ""] }, { $not: ["$break_out"] }],
              },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$break_out" },
                },
              },
            },
          },
        },
      },
      {
        $sort: sort.key
          ? { [sort.key]: sort.order === "asc" ? 1 : -1 }
          : { date: -1 },
      },
      {
        $facet: {
          metadata: [{ $count: "totalRecords" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    let result = await AttendanceModel.aggregate(pipeline);

    let attendanceRecords = result[0].data;
    const totalRecords =
      result[0].metadata.length > 0 ? result[0].metadata[0].totalRecords : 0;

    attendanceRecords = attendanceRecords.map((record) => ({
      ...record,
      time_in: record.time_in_24
        ? moment(record.time_in_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
      time_out: record.time_out_24
        ? moment(record.time_out_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
      break_in: record.break_in_24
        ? moment(record.break_in_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
      break_out: record.break_out_24
        ? moment(record.break_out_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
    }));

    res.status(200).json({
      message: "Attendance records fetched successfully",
      list: attendanceRecords,
      total: totalRecords,
    });
  } catch (error) {
    console.error("Error getting attendance records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.recordBreakTime = async (req, res) => {
  try {
    const { id } = req.params;

    const { employee, date, break_in, break_out } = req.body;

    const existAttendance = await AttendanceModel.findById(id);

    if (!existAttendance) {
      return res.status(404).json({
        message: "There is no attendance data for this employee.",
      });
    }

    if (existAttendance.time_out || existAttendance.time_out !== "") {
      return res.status(404).json({
        message: "This employee has already left work.",
      });
    }

    if (
      (existAttendance.break_in || existAttendance.break_in !== "") &&
      (existAttendance.break_out || existAttendance.break_out !== "")
    ) {
      return res.status(404).json({
        message: "This employee has already taken a break.",
      });
    }

    if (existAttendance.break_out || existAttendance.break_out !== "") {
      return res.status(404).json({
        message: "This employee has already finished his break.",
      });
    }

    const employeeSchedule = await EmployeeScheduleModel.findOne({
      employee: employee,
      status: "Present",
      from: { $lte: date },
      to: { $gte: date },
    });

    if (!employeeSchedule) {
      return res.status(400).json({
        message: "No active schedule found for this employee.",
      });
    }

    const formattedBreakIn = break_in
      ? moment(`${date} ${break_in}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";
    const formattedBreakOut = break_out
      ? moment(`${date} ${break_out}`).format("YYYY-MM-DD hh:mm:ss A")
      : "";

    const scheduleId = await AttendanceModel.findByIdAndUpdate(id, {
      employee,
      date,
      break_in: formattedBreakIn,
      break_out: formattedBreakOut,
    });

    res
      .status(200)
      .json({ message: "Schedule created successfully", schedule: scheduleId });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: error.message });
  }
};

exports.getTotalAttendance = async (req, res) => {
  try {
    let dateFilter = {};

    const { query } = req.query;

    if (query !== "") {
      try {
        const parsedDates = JSON.parse(query);
        if (Array.isArray(parsedDates) && parsedDates.length === 2) {
          const [startDate, endDate] = parsedDates.map((date) =>
            moment(date).format("YYYY-MM-DD")
          );
          dateFilter = { date: { $gte: startDate, $lte: endDate } };
        }
      } catch (error) {
        console.error("Invalid query format:", error);
        return res.status(400).json({ message: "Invalid date query format" });
      }
    }

    if (req.user.account_type === "Admin") {
      dateFilter["employeeData.company_id"] = req.user.employeeData.company_id;
    }

    const pipeline = [
      {
        $lookup: {
          from: "employees",
          localField: "employee",
          foreignField: "_id",
          as: "employeeData",
        },
      },
      {
        $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true },
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
          "employeeData.company_id": 1,
          "employeeData.full_name": 1,
          time_in_24: {
            $cond: {
              if: { $or: [{ $eq: ["$time_in", ""] }, { $not: ["$time_in"] }] },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$time_in" },
                },
              },
            },
          },
          time_out_24: {
            $cond: {
              if: {
                $or: [{ $eq: ["$time_out", ""] }, { $not: ["$time_out"] }],
              },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$time_out" },
                },
              },
            },
          },
          break_in_24: {
            $cond: {
              if: {
                $or: [{ $eq: ["$break_in", ""] }, { $not: ["$break_in"] }],
              },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$break_in" },
                },
              },
            },
          },
          break_out_24: {
            $cond: {
              if: {
                $or: [{ $eq: ["$break_out", ""] }, { $not: ["$break_out"] }],
              },
              then: null,
              else: {
                $dateToString: {
                  format: "%H:%M:%S",
                  date: { $toDate: "$break_out" },
                },
              },
            },
          },
        },
      },
      {
        $match: dateFilter,
      },
    ];

    let result = await AttendanceModel.aggregate(pipeline);

    let attendanceRecords = result;

    attendanceRecords = attendanceRecords.map((record) => ({
      ...record,
      time_in: record.time_in_24
        ? moment(record.time_in_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
      time_out: record.time_out_24
        ? moment(record.time_out_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
      break_in: record.break_in_24
        ? moment(record.break_in_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
      break_out: record.break_out_24
        ? moment(record.break_out_24, "HH:mm:ss").format("hh:mm:ss A")
        : null,
    }));

    res.status(200).json({
      message: "Attendance records fetched successfully",
      list: attendanceRecords,
    });
  } catch (error) {
    console.error("Error getting attendance records:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};
