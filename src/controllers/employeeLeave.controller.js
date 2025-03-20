const EmployeeLeaveModel = require('../models/employeeLeave.model');
const moment = require('moment');

exports.createEmployeeLeave = async (req, res) => {
  try {
    const { leaveType, leaveFrom, leaveTo, leaveReturn, reason } = req.body;

    const { employee } = req.user;

    const newLeave = new EmployeeLeaveModel({
      LeaveType: leaveType,
      leaveFrom: leaveFrom,
      leaveTo: leaveTo,
      leaveReturn: leaveReturn,
      reason: reason,
      employee: employee,
    });

    const leaveId = await newLeave.save();

    res.json({ message: 'Create Success', job_title: leaveId });
  } catch (error) {
    console.log(error);
  }
};

exports.getPersonalEmployeeLeave = async (req, res) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = '', sort = {} } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    let dateFilter = {};

    if (query !== '') {
      try {
        const parsedDates = JSON.parse(query);
        if (Array.isArray(parsedDates) && parsedDates.length === 2) {
          const [startDate, endDate] = parsedDates.map((date) => moment(date).format('YYYY-MM-DD'));

          dateFilter = {
            $or: [
              { leaveFrom: { $gte: startDate, $lte: endDate } },
              { leaveTo: { $gte: startDate, $lte: endDate } },
              { leaveReturn: { $gte: startDate, $lte: endDate } },
            ],
          };
        }
      } catch (error) {
        console.error('Invalid query format:', error);
        return res.status(400).json({ message: 'Invalid date query format' });
      }
    }

    const { employee } = req.user;

    const pipeline = [
      {
        $lookup: {
          from: 'leavetypes',
          localField: 'leaveType',
          foreignField: '_id',
          as: 'leaveType',
        },
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
        $unwind: { path: '$leaveType', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$employeeData', preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          employee: employee,
          ...dateFilter,
        },
      },
      {
        $sort: sort.key ? { [sort.key]: sort.order === 'asc' ? 1 : -1 } : { full_name: 1 },
      },
      {
        $facet: {
          metadata: [{ $count: 'totalEmployees' }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await EmployeeLeaveModel.aggregate(pipeline);

    let leaveRecords = result[0].data;
    const totalRecords = result[0].metadata.length > 0 ? result[0].metadata[0].totalEmployees : 0;

    leaveRecords = leaveRecords.map((record) => ({
      ...record,
      leaveFrom: moment(record.leaveFrom).format('YYYY-MM-DD'),
      leaveTo: moment(record.leaveTo).format('YYYY-MM-DD'),
      leaveReturn: moment(record.leaveReturn).format('YYYY-MM-DD'),
    }));

    res.status(200).json({
      message: 'Employee leave records fetched successfully',
      list: leaveRecords,
      total: totalRecords,
    });
  } catch (error) {
    console.error('Error getting employee leave records:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getPersonalEmployeeLeaveDetail = async (req, res) => {
  try {
    const { id } = req.params;

    console.log(id);

    if (!id) {
      return res.status(400).json({ message: 'Leave ID is required' });
    }

    const leaveRecord = await EmployeeLeaveModel.findById(id);

    if (!leaveRecord) {
      return res.status(404).json({ message: 'Leave record not found' });
    }

    res.status(200).json({
      message: 'Employee Leave detail fetched successfully',
      leaveRecord,
    });
  } catch (error) {
    console.error('Error getting employee leave detail:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

exports.updateEmployeeLeave = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({ message: 'Leave ID is required' });
    }

    const { leaveType, leaveFrom, leaveTo, leaveReturn, reason } = req.body;

    const updatedLeave = await EmployeeLeaveModel.findByIdAndUpdate(
      id,
      {
        LeaveType: leaveType,
        leaveFrom: leaveFrom,
        leaveTo: leaveTo,
        leaveReturn: leaveReturn,
        reason: reason,
      },
      { new: true },
    );

    if (!updatedLeave) {
      return res.status(404).json({ message: 'Leave record not found' });
    }

    res.status(200).json({ message: 'Update Success', job_title: updatedLeave });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
