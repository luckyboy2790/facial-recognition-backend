const mongoose = require("mongoose");
const CompanyModel = require("../models/company.model");
const DepartmentModel = require("../models/department.model");
const JobTitleModel = require("../models/jobTitile.model");
const LeaveGroupModel = require("../models/leaveGroup.model");
const EmployeeModel = require("../models/employee.model");
const UserModel = require("../models/user.model");
const { encrypt, decrypt } = require("../middlewares/cryptFunction");
const Employee = require("../models/employee.model");

exports.getTotalFieldsData = async (req, res) => {
  try {
    let filter = {};

    if (req.user.account_type === "Admin") {
      filter.company = req.user.employeeData.company_id;
    }

    console.log(filter);

    const company = await CompanyModel.find({});
    const department = await DepartmentModel.find(filter);
    const jobTitle = await JobTitleModel.find(filter);
    const leaveGroup = await LeaveGroupModel.find(filter);

    res.json({ company, department, jobTitle, leaveGroup });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.createEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      dialCode,
      phoneNumber,
      address,
      gender,
      civilStatus,
      height,
      weight,
      age,
      birthday,
      nationalId,
      placeOfBirth,
      img,
      company,
      department,
      jobTitle,
      pin,
      companyEmail,
      leaveGroup,
      employmentType,
      employmentStatus,
      officialStartDate,
      dateRegularized,
      faceDescriptor,
    } = req.body;

    const existingEmployee = await EmployeeModel.findOne({ email });

    if (existingEmployee) {
      return res
        .status(400)
        .json({ error: `Employee with email ${email} already exists` });
    }

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res
        .status(400)
        .json({ error: "Face descriptor is invalid or missing" });
    }

    const hashedPin = encrypt(pin);

    const newEmployee = new EmployeeModel({
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      email,
      dial_code: dialCode,
      phone_number: phoneNumber,
      img,
      address,
      gender,
      civil_status: civilStatus,
      height,
      weight,
      age,
      birthday,
      national_id: nationalId,
      place_of_birth: placeOfBirth,
      company_id: company,
      department_id: department,
      job_title_id: jobTitle,
      pin: hashedPin,
      company_email: companyEmail,
      leave_group_id: leaveGroup,
      employee_type: employmentType,
      employee_status: employmentStatus,
      official_start_date: officialStartDate,
      date_regularized: dateRegularized,
    });

    const employees = await EmployeeModel.find({});

    let existPin = false;

    for (let employee of employees) {
      if (decrypt(employee.pin) === pin) {
        existPin = true;
      }
    }

    if (existPin) {
      return res.status(400).json({
        message: "The PIN exists. Please check again.",
      });
    }

    const savedEmployee = await newEmployee.save();

    savedEmployee.face_info = {
      name: `${savedEmployee._id}`,
      descriptors: [faceDescriptor],
    };

    await savedEmployee.save();

    res.status(200).json({
      message: "Employee created successfully",
      employee: savedEmployee,
    });
  } catch (error) {
    console.error("Error creating employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    const { pageIndex = 1, pageSize = 10, query = "", sort = {} } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    const user = await UserModel.findOne({ account_type: "SuperAdmin" });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const filter = {
      _id: { $ne: user.employee },
    };

    if (query) {
      filter.$or = [
        { full_name: { $regex: query, $options: "i" } },
        { employee_status: { $regex: query, $options: "i" } },
        { "company.company_name": { $regex: query, $options: "i" } },
        { "department.department_name": { $regex: query, $options: "i" } },
        { "job_title.job_title": { $regex: query, $options: "i" } },
        { "leave_group.group_name": { $regex: query, $options: "i" } },
      ];
    }

    if (req.user.account_type === "Admin" && req.user.employeeData) {
      filter.company_id = req.user.employeeData?.company_id;
      filter._id = { ...filter._id, $ne: req.user.employee };
    }

    const pipeline = [
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

    const result = await EmployeeModel.aggregate(pipeline);

    const employees = result[0].data;
    const totalEmployees =
      result[0].metadata.length > 0 ? result[0].metadata[0].totalEmployees : 0;

    res.status(200).json({
      message: "Employees fetched successfully",
      list: employees,
      total: totalEmployees,
    });
  } catch (error) {
    console.error("Error getting employees:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getEmployeeDetail = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
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
    ];

    const employeeData = await EmployeeModel.aggregate(pipeline);

    if (!employeeData || employeeData.length === 0) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const employee = employeeData[0];

    if (employee.pin) {
      try {
        employee.pin = decrypt(employee.pin);
      } catch (err) {
        console.error("Error decrypting PIN:", err);
        employee.pin = null;
      }
    }

    res
      .status(200)
      .json({ message: "Employee fetched successfully", data: employee });
  } catch (error) {
    console.error("Error getting employee details:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      dialCode,
      phoneNumber,
      address,
      gender,
      civilStatus,
      height,
      weight,
      age,
      birthday,
      nationalId,
      placeOfBirth,
      img,
      company,
      department,
      jobTitle,
      pin,
      companyEmail,
      leaveGroup,
      employmentType,
      employmentStatus,
      officialStartDate,
      dateRegularized,
      faceDescriptor,
      _id,
    } = req.body;

    if (!_id || !mongoose.Types.ObjectId.isValid(_id)) {
      return res.status(400).json({ error: "Invalid employee ID" });
    }

    let updateData = {
      first_name: firstName,
      last_name: lastName,
      full_name: `${firstName} ${lastName}`,
      email,
      dial_code: dialCode,
      phone_number: phoneNumber,
      img,
      address,
      gender,
      civil_status: civilStatus,
      height,
      weight,
      age,
      birthday,
      national_id: nationalId,
      place_of_birth: placeOfBirth,
      company_id: company,
      department_id: department,
      job_title_id: jobTitle,
      company_email: companyEmail,
      leave_group_id: leaveGroup,
      employee_type: employmentType,
      employee_status: employmentStatus,
      official_start_date: officialStartDate,
      date_regularized: dateRegularized,
      face_info: {
        name: `${_id}`,
        descriptors: [faceDescriptor],
      },
      pin: encrypt(pin),
    };

    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(
      _id,
      updateData,
      { new: true }
    );

    if (!updatedEmployee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    const userData = await UserModel.findOne({ employee: _id });

    if (userData) {
      userData.email = email;

      await userData.save();
    }

    res.status(200).json({
      message: "Employee updated successfully",
      employee: updatedEmployee,
    });
  } catch (error) {
    console.error("Error updating employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    const data = req.body;

    for (let id of data.employeeIds) {
      const employee_id = await EmployeeModel.findByIdAndDelete(id);

      if (!employee_id) {
        throw new Error("Delete failed");
      }
    }

    res.json({ message: "Delete Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.archiveEmployee = async (req, res) => {
  try {
    const { employeeId } = req.body;

    if (!employeeId) {
      return res.status(400).json({ error: "Employee ID is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: "Invalid Employee ID" });
    }

    const employee = await EmployeeModel.findByIdAndUpdate(
      employeeId,
      { employee_status: "Archived" },
      { new: true, runValidators: true }
    );

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ employee });
  } catch (error) {
    console.error("Error archiving employee:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.getTotalEmployee = async (req, res) => {
  try {
    const user = await UserModel.findOne({ account_type: "SuperAdmin" });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const filter = {
      _id: { $ne: user.employee },
    };

    if (req.user.account_type === "Admin") {
      filter.company_id = req.user.employeeData.company_id;
    }

    const pipeline = [
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
        $match: filter,
      },
    ];

    const employeeData = await EmployeeModel.aggregate(pipeline);

    res.json({ employeeData });
  } catch (error) {
    console.log(error);

    res.status(200).json({ error: error.message });
  }
};

exports.getTotalEmployeeFaceInfo = async (req, res) => {
  try {
    const employees = await EmployeeModel.find({
      "face_info.descriptors": { $exists: true, $ne: [] },
    });

    const faceInfoData = {};

    employees.forEach((employee) => {
      if (employee.face_info && employee.face_info.descriptors.length > 0) {
        faceInfoData[employee.full_name] = {
          name: employee.face_info.name,
          descriptors: employee.face_info.descriptors,
        };
      }
    });

    res.status(200).json(faceInfoData);
  } catch (error) {
    console.error("Error fetching employee face info:", error);
    res.status(500).json({ error: "Internal server error" });
  }
};

exports.pinCheckOutAttendance = async (req, res) => {
  try {
    const { pin } = req.body;

    const employees = await Employee.find({
      account_type: { $ne: "SuperAdmin" },
    });

    for (let employee of employees) {
      if (decrypt(employee?.pin) === pin) {
        existEmployee = employee;

        break;
      }
    }

    if (!existEmployee) {
      return res.status(404).json({ message: "Invalid PIN" });
    }

    return res.status(200).json(existEmployee);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
