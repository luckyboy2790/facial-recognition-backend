const LeaveGroupModel = require("../models/leaveGroup.model");

exports.createLeaveGroup = async (req, res) => {
  try {
    console.log(req.body);

    const {
      leaveGroupName,
      description,
      leavePrivilege,
      groupStatus,
      company,
    } = req.body;

    const newLeaveGroup = new LeaveGroupModel({
      group_name: leaveGroupName,
      description,
      leaveprivileges: leavePrivilege,
      status: groupStatus,
      company: company ? company : req.user.employeeData.company_id,
    });

    const leaveGroupId = await newLeaveGroup.save();

    res.json({ message: "Create Success", leave_group: leaveGroupId });
  } catch (error) {
    console.log(error);
  }
};

exports.getLeaveGroup = async (req, res) => {
  try {
    console.log(req.query);

    let { pageIndex, pageSize, query, sort } = req.query;

    pageIndex = parseInt(pageIndex) || 1;
    pageSize = parseInt(pageSize) || 10;

    const filter = query
      ? { group_name: { $regex: query, $options: "i" } }
      : {};

    let sortOption = {};
    if (sort && sort.key) {
      sortOption[sort.key] = sort.order === "desc" ? -1 : 1;
    } else {
      sortOption["group_name"] = -1;
    }

    if (req.user.account_type === "Admin") {
      filter.company = req.user.employeeData.company_id;
    }

    const leaveGroups = await LeaveGroupModel.aggregate([
      { $match: filter },

      {
        $lookup: {
          from: "leavetypes",
          localField: "leaveprivileges",
          foreignField: "_id",
          as: "leaveTypes",
        },
      },

      {
        $lookup: {
          from: "companies",
          localField: "company",
          foreignField: "_id",
          as: "companyData",
        },
      },

      {
        $addFields: {
          leaveprivilegesData: "$leaveTypes",
          leaveTypeNames: {
            $cond: {
              if: { $gt: [{ $size: "$leaveTypes" }, 0] },
              then: {
                $reduce: {
                  input: "$leaveTypes",
                  initialValue: "",
                  in: {
                    $concat: [
                      "$$value",
                      { $cond: [{ $eq: ["$$value", ""] }, "", ", "] },
                      "$$this.leave_name",
                    ],
                  },
                },
              },
              else: "No Leave Types",
            },
          },
        },
      },

      {
        $unwind: { path: "$companyData", preserveNullAndEmptyArrays: true },
      },

      { $sort: sortOption },
      { $skip: (pageIndex - 1) * pageSize },
      { $limit: pageSize },
    ]);

    const totalLeaveGroups = await LeaveGroupModel.countDocuments(filter);

    res.json({
      message: "success",
      list: leaveGroups,
      total: totalLeaveGroups,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.updateLeaveGroup = async (req, res) => {
  try {
    const { _id, leaveGroupName, description, leavePrivilege, groupStatus } =
      req.body;

    if (!_id) {
      return res.status(400).json({ message: "Leave Group ID is required" });
    }

    const updatedLeaveGroup = await LeaveGroupModel.findByIdAndUpdate(
      _id,
      {
        group_name: leaveGroupName,
        description: description,
        leaveprivileges: leavePrivilege,
        status: groupStatus,
      },
      { new: true }
    );

    if (!updatedLeaveGroup) {
      return res.status(404).json({ message: "Leave Group not found" });
    }

    res
      .status(200)
      .json({ message: "Create Success", leave_group: updatedLeaveGroup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteLeaveGroup = async (req, res) => {
  try {
    console.log(req.body);
    const data = req.body;

    for (let id of data.leaveTypeIds) {
      const company_id = await LeaveGroupModel.findByIdAndDelete(id);

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
