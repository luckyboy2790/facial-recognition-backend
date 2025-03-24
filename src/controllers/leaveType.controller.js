const LeaveTypeModel = require("../models/leaveType.model");

exports.createJobTitle = async (req, res) => {
  try {
    const { leaveName, company } = req.body;

    const newLeave = new LeaveTypeModel({
      leave_name: leaveName,
      company: company ? company : req.user.employeeData.company_id,
    });

    const leaveId = await newLeave.save();

    res.json({ message: "Create Success", company: leaveId });
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

    let filter = query
      ? { company_name: { $regex: query, $options: "i" } }
      : {};

    if (req.user.account_type === "Admin") {
      filter.company = req.user.employeeData.company_id;
    }

    let sortOption = {};
    if (sort && sort.key) {
      sortOption[sort.key] = sort.order === "desc" ? -1 : 1;
    } else {
      sortOption["leave_name"] = 1;
    }

    const pipeline = [
      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyData",
        },
      },
      {
        $unwind: { path: "$companyData", preserveNullAndEmptyArrays: true },
      },
      { $match: filter },
      { $sort: sortOption },
      { $skip: (pageIndex - 1) * pageSize },
      { $limit: pageSize },
    ];

    const leaveTypes = await LeaveTypeModel.aggregate(pipeline);

    const totalLeaveTypes = await LeaveTypeModel.countDocuments(filter);

    res.json({
      message: "success",
      list: leaveTypes,
      total: totalLeaveTypes,
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
        throw new Error("Delete failed");
      }
    }

    res.json({ message: "Delete Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
