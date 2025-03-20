const LeaveTypeModel = require('../models/leaveType.model');

exports.createJobTitle = async (req, res) => {
  try {
    console.log(req.body);

    const { leaveName } = req.body;

    const newLeave = new LeaveTypeModel({
      leave_name: leaveName,
    });

    const leaveId = await newLeave.save();

    res.json({ message: 'Create Success', company: leaveId });
  } catch (error) {
    console.log(error);
  }
};

exports.getJobTitle = async (req, res) => {
  try {
    console.log(req.query);

    let { pageIndex, pageSize, query, sort } = req.query;

    pageIndex = parseInt(pageIndex) || 1;
    pageSize = parseInt(pageSize) || 10;

    const filter = query ? { company_name: { $regex: query, $options: 'i' } } : {};

    let sortOption = {};
    if (sort && sort.key) {
      sortOption[sort.key] = sort.order === 'desc' ? -1 : 1;
    }

    const jobTitles = await LeaveTypeModel.find(filter)
      .sort(sortOption)
      .skip((pageIndex - 1) * pageSize)
      .limit(pageSize);

    const totalJobTitles = await LeaveTypeModel.countDocuments(filter);

    res.json({
      message: 'success',
      list: jobTitles,
      total: totalJobTitles,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteJobTitle = async (req, res) => {
  try {
    console.log(req.body);
    const data = req.body;

    for (let id of data.leaveTypeIds) {
      const company_id = await LeaveTypeModel.findByIdAndDelete(id);

      if (!company_id) {
        throw new Error('Delete failed');
      }
    }

    res.json({ message: 'Delete Successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
