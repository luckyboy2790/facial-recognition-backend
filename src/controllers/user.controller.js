const UserRoleModel = require("../models/role.model");
const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");
const mongoose = require("mongoose");

exports.createRole = async (req, res) => {
  try {
    const { name, status, accessRight, userType, company } = req.body;

    const newRole = new UserRoleModel({
      name: name,
      status: status,
      company: company ? company : req.user.employeeData.company_id,
      userType: userType,
      accessRight: accessRight,
    });

    await newRole.save();

    res.status(200).json({ message: "Create successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error });
  }
};

exports.getRole = async (req, res) => {
  try {
    let filter = {};

    if (req.user.account_type === "Admin") {
      filter.company = req.user.employeeData.company_id;
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
      { $unwind: { path: "$companyData", preserveNullAndEmptyArrays: true } },
      {
        $match: filter,
      },
    ];

    const roleList = await UserRoleModel.aggregate(pipeline);

    res.status(200).send({ message: "Fetch Role Data successfully", roleList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateRole = async (req, res) => {
  try {
    const { id } = req.params;

    const { name, status, accessRight, userType, company } = req.body;

    await UserRoleModel.findByIdAndUpdate(id, {
      name: name,
      status: status,
      userType: userType,
      company: company ? company : req.user.employeeData.company_id,
      accessRight: accessRight,
    });

    res.status(200).json({ message: "Update successfully" });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    await UserRoleModel.findByIdAndDelete(id);

    res.status(200).json({ message: "Delete successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

// ------------------- */ User /* -------------------

exports.createUser = async (req, res) => {
  try {
    const { employee, email, status, account_type, role, password } = req.body;

    const existEmployee = await UserModel.findOne({ employee: employee });

    if (existEmployee) {
      return res.status(500).json({ message: "Employee exist!" });
    }

    const newUser = new UserModel({
      employee,
      email,
      status,
      account_type,
      role,
      password: bcrypt.hashSync(password, 8),
    });

    await newUser.save();

    res.status(200).json({ message: "Create successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", sort = {} } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    let filter = {
      account_type: { $ne: "SuperAdmin" },
    };

    if (query) {
      filter.$or = [
        { email: { $regex: query, $options: "i" } },
        { account_type: { $regex: query, $options: "i" } },
        { status: { $regex: query, $options: "i" } },
        { "employeeData.full_name": { $regex: query, $options: "i" } },
        { "roleData.name": { $regex: query, $options: "i" } },
      ];
    }

    if (req.user.account_type === "Admin") {
      filter["employeeData.company_id"] = req.user.employeeData.company_id;
      filter._id = { $ne: req.user._id };
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
        $lookup: {
          from: "userroles",
          localField: "role",
          foreignField: "_id",
          as: "roleData",
        },
      },
      {
        $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true },
      },
      {
        $match: filter,
      },
      {
        $sort: sort.key
          ? { [sort.key]: sort.order === "asc" ? 1 : -1 }
          : { full_name: 1 },
      },
      {
        $facet: {
          metadata: [{ $count: "totalEmployees" }],
          data: [{ $skip: skip }, { $limit: limit }],
        },
      },
    ];

    const result = await UserModel.aggregate(pipeline);

    const users = result[0].data;
    const totalUsers =
      result[0].metadata.length > 0 ? result[0].metadata[0].totalEmployees : 0;

    res.status(200).json({
      message: "Employees fetched successfully",
      list: users,
      total: totalUsers,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getUserDetail = async (req, res) => {
  try {
    const { id } = req.params;

    const objectId = new mongoose.Types.ObjectId(id);

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
        $lookup: {
          from: "userroles",
          localField: "role",
          foreignField: "_id",
          as: "roleData",
        },
      },
      {
        $unwind: { path: "$employeeData", preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: "$roleData", preserveNullAndEmptyArrays: true },
      },
      {
        $match: { _id: objectId },
      },
    ];

    const userDetail = await UserModel.aggregate(pipeline);

    res
      .status(200)
      .json({ message: "Fetch Data successfully", userDetail: userDetail[0] });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.updateUserData = async (req, res) => {
  try {
    const { id } = req.params;

    const { employee, email, status, account_type, role, password } = req.body;

    const updateData = {
      employee,
      email,
      status,
      account_type,
      role,
    };

    if (password) {
      updateData.password = bcrypt.hashSync(password, 8);
    }

    await UserModel.findByIdAndUpdate(id, updateData, { new: true });

    res.status(200).json({ message: "Update Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const data = req.body;

    console.log(data);

    for (let id of data.userIds) {
      const user_id = await UserModel.findByIdAndDelete(id);

      if (!user_id) {
        throw new Error("Delete failed");
      }
    }

    res.json({ message: "Delete Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
