const CompanyModel = require("../models/company.model");
const DepartmentModel = require("../models/department.model");
const JobTitleModel = require("../models/jobTitile.model");
const LeaveGroupModel = require("../models/leaveGroup.model");
const EmployeeModel = require("../models/employee.model");
const AttendanceModel = require("../models/attendance.model");
const EmployeeLeaveModel = require("../models/employeeLeave.model");
const UserModel = require("../models/user.model");

exports.getDashboardDataByAdmin = async (req, res) => {
  try {
    const companyId = req.user.employeeData.company_id;

    const superAdmin = await UserModel.findOne({ account_type: "SuperAdmin" });

    let employeeFilter = { _id: { $ne: superAdmin.employee } };

    if (req.user.account_type === "Admin") {
      employeeFilter.company_id = companyId;
    }

    const employeePipeline = [
      {
        $lookup: {
          from: "companies",
          localField: "company_id",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $lookup: {
          from: "departments",
          localField: "department_id",
          foreignField: "_id",
          as: "department",
        },
      },
      {
        $lookup: {
          from: "job_titles",
          localField: "job_title_id",
          foreignField: "_id",
          as: "job_title",
        },
      },
      {
        $lookup: {
          from: "leavegroups",
          localField: "leave_group_id",
          foreignField: "_id",
          as: "leave_group",
        },
      },
      {
        $unwind: { path: "$company", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$department", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$job_title", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$leave_group", preserveNullAndEmptyArrays: true },
      },
      {
        $match: employeeFilter,
      },
      {
        $sort: {
          official_start_date: -1,
        },
      },
      {
        $limit: 5,
      },
    ];

    const employeeData = await EmployeeModel.aggregate(employeePipeline);

    let attendanceFilter = {};
    if (req.user.account_type === "Admin") {
      attendanceFilter = { "employeeData.company_id": companyId };
    }

    const attendancePipeline = [
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
          time_in: 1,
          time_out: 1,
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
        },
      },
      {
        $match: attendanceFilter,
      },
      {
        $sort: {
          date: -1,
        },
      },
      {
        $limit: 5,
      },
    ];

    const attendanceData = await AttendanceModel.aggregate(attendancePipeline);

    const attendance = attendanceData
      .map((item, key) => {
        const attendanceRecords = [];

        if (item.time_in_24 && item.time_in_24 !== null) {
          attendanceRecords.push({
            _id: item._id + item.time_in_24,
            full_name: item.employeeData.full_name,
            type: "Time In",
            originalTime: item.time_in,
            time: item.time_in_24,
          });
        }

        if (item.time_out_24 && item.time_out_24 !== null) {
          attendanceRecords.push({
            _id: item._id + item.time_out_24,
            full_name: item.employeeData.full_name,
            type: "Time Out",
            originalTime: item.time_out,
            time: item.time_out_24,
          });
        }

        return attendanceRecords;
      })
      .flat();

    const parseTime = (timeString) => {
      return new Date(timeString);
    };

    const sortedAttendance = attendance.sort((a, b) => {
      const timeA = parseTime(a.originalTime);
      const timeB = parseTime(b.originalTime);
      return timeB - timeA;
    });

    const top5Attendance = sortedAttendance.slice(0, 5);

    let leaveFilter = {};
    if (req.user.account_type === "Admin") {
      leaveFilter = { "employeeData.company_id": companyId };
    }

    const leavePipeline = [
      {
        $lookup: {
          from: "leavetypes",
          localField: "leaveType",
          foreignField: "_id",
          as: "leaveTypeData",
        },
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
        $unwind: { path: "$leaveTypeData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true },
      },
      {
        $match: leaveFilter,
      },
      {
        $sort: {
          leaveReturn: -1,
        },
      },
    ];

    const leaveData = await EmployeeLeaveModel.aggregate(leavePipeline);

    const responseData = {
      "Newest Employees": employeeData,
      "Recent Attendances": top5Attendance,
      "Recent Leaves of Absence": leaveData,
    };

    res.status(200).json(responseData);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getDashboardCardData = async (req, res) => {
  try {
    const superAdmin = await UserModel.findOne({ account_type: "SuperAdmin" });

    let employeeFilter = {};

    if (req.user.account_type === "Admin") {
      employeeFilter.company_id = req.user.employeeData.company_id;
    }

    const regularEmployee = await EmployeeModel.find({
      employee_type: "Regular",
      _id: { $ne: superAdmin.employee },
      ...employeeFilter,
    }).countDocuments();

    const traineeEmployee = await EmployeeModel.find({
      employee_type: "Trainee",
      _id: { $ne: superAdmin.employee },
      ...employeeFilter,
    }).countDocuments();

    let attendanceFilter = {};
    if (req.user.account_type === "Admin") {
      attendanceFilter = {
        "employeeData.company_id": req.user.employeeData.company_id,
      };
    }

    const onlineAttendancePipeline = [
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
        $match: { ...attendanceFilter, time_out: "" },
      },
      {
        $count: "onlineCount",
      },
    ];

    const offlineAttendancePipeline = [
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
        $match: { ...attendanceFilter, time_out: { $ne: "" } },
      },
      {
        $count: "offlineCount",
      },
    ];

    const onlineAttendance = await AttendanceModel.aggregate(
      onlineAttendancePipeline
    );

    const offlineAttendance = await AttendanceModel.aggregate(
      offlineAttendancePipeline
    );

    const onlineCount =
      onlineAttendance.length > 0 ? onlineAttendance[0].onlineCount : 0;
    const offlineCount =
      offlineAttendance.length > 0 ? offlineAttendance[0].offlineCount : 0;

    let leaveFilter = {};

    if (req.user.account_type === "Admin") {
      leaveFilter = {
        "employeeData.company_id": req.user.employeeData.company_id,
      };
    }

    const approveLeavePipeline = [
      {
        $lookup: {
          from: "leavetypes",
          localField: "leaveType",
          foreignField: "_id",
          as: "leaveTypeData",
        },
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
        $unwind: { path: "$leaveTypeData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true },
      },
      {
        $match: { ...leaveFilter, status: "Approved" },
      },
      {
        $count: "approvedCount",
      },
    ];

    const pendingLeavePipeline = [
      {
        $lookup: {
          from: "leavetypes",
          localField: "leaveType",
          foreignField: "_id",
          as: "leaveTypeData",
        },
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
        $unwind: { path: "$leaveTypeData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true },
      },
      {
        $match: { ...leaveFilter, status: "Pending" },
      },
      {
        $count: "pendingCount",
      },
    ];

    const approveLeave = await EmployeeLeaveModel.aggregate(
      approveLeavePipeline
    );
    const pendingLeave = await EmployeeLeaveModel.aggregate(
      pendingLeavePipeline
    );

    const approveCount =
      approveLeave.length > 0 ? approveLeave[0].approvedCount : 0;
    const pendingCount =
      pendingLeave.length > 0 ? pendingLeave[0].pendingCount : 0;

    const result = {
      regularEmployee,
      traineeEmployee,
      onlineCount,
      offlineCount,
      approveCount,
      pendingCount,
    };

    res.status(200).json(result);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
