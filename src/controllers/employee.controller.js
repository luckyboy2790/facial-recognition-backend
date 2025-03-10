const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
const CompanyModel = require('../models/company.model');
const DepartmentModel = require('../models/department.model');
const JobTitleModel = require('../models/jobTitile.model');
const LeaveGroupModel = require('../models/leaveGroup.model');
const EmployeeModel = require('../models/employee.model');

exports.getTotalFieldsData = async (req, res) => {
  try {
    const company = await CompanyModel.find({});
    const department = await DepartmentModel.find({});
    const jobTitle = await JobTitleModel.find({});
    const leaveGroup = await LeaveGroupModel.find({});

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

    if (!faceDescriptor || !Array.isArray(faceDescriptor)) {
      return res.status(400).json({ error: 'Face descriptor is invalid or missing' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPin = await bcrypt.hash(pin, salt);

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
      face_info: {
        name: `${firstName} ${lastName}`,
        descriptors: [faceDescriptor],
      },
    });

    await newEmployee.save();
    res.status(200).json({ message: 'Employee created successfully', employee: newEmployee });
  } catch (error) {
    console.error('Error creating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployee = async (req, res) => {
  try {
    console.log(req.query);

    const { pageIndex = 1, pageSize = 10, query = '', sort = {} } = req.query;

    const page = parseInt(pageIndex, 10);
    const limit = parseInt(pageSize, 10);
    const skip = (page - 1) * limit;

    const pipeline = [
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company',
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $lookup: {
          from: 'job_titles',
          localField: 'job_title_id',
          foreignField: '_id',
          as: 'job_title',
        },
      },
      {
        $lookup: {
          from: 'leavegroups',
          localField: 'leave_group_id',
          foreignField: '_id',
          as: 'leave_group',
        },
      },
      {
        $unwind: { path: '$company', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$department', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$job_title', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$leave_group', preserveNullAndEmptyArrays: true },
      },
      {
        $match: {
          $or: [
            { full_name: { $regex: query, $options: 'i' } },
            { employee_status: { $regex: query, $options: 'i' } },
            { 'company.company_name': { $regex: query, $options: 'i' } },
            { 'department.department_name': { $regex: query, $options: 'i' } },
            { 'job_title.job_title': { $regex: query, $options: 'i' } },
            { 'leave_group.group_name': { $regex: query, $options: 'i' } },
          ],
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

    const result = await EmployeeModel.aggregate(pipeline);

    const employees = result[0].data;
    const totalEmployees = result[0].metadata.length > 0 ? result[0].metadata[0].totalEmployees : 0;

    console.log(employees);

    res.status(200).json({
      message: 'Employees fetched successfully',
      list: employees,
      total: totalEmployees,
    });
  } catch (error) {
    console.error('Error getting employees:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.getEmployeeDetail = async (req, res) => {
  try {
    console.log(req.params);
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ error: 'Invalid employee ID' });
    }

    const pipeline = [
      {
        $match: { _id: new mongoose.Types.ObjectId(id) },
      },
      {
        $lookup: {
          from: 'companies',
          localField: 'company_id',
          foreignField: '_id',
          as: 'company',
        },
      },
      {
        $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $lookup: {
          from: 'job_titles',
          localField: 'job_title_id',
          foreignField: '_id',
          as: 'job_title',
        },
      },
      {
        $lookup: {
          from: 'leavegroups',
          localField: 'leave_group_id',
          foreignField: '_id',
          as: 'leave_group',
        },
      },
      {
        $unwind: { path: '$company', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$department', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$job_title', preserveNullAndEmptyArrays: true },
      },
      {
        $unwind: { path: '$leave_group', preserveNullAndEmptyArrays: true },
      },
    ];

    const employee = await EmployeeModel.aggregate(pipeline);

    console.log(employee);

    if (!employee || employee.length === 0) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee fetched successfully', data: employee[0] });
  } catch (error) {
    console.error('Error getting employee details:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.updateEmployee = async (req, res) => {
  try {
    console.log(req.body);

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
      return res.status(400).json({ error: 'Invalid employee ID' });
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
        name: `${firstName} ${lastName}`,
        descriptors: [faceDescriptor],
      },
    };

    if (pin) {
      const salt = await bcrypt.genSalt(10);
      updateData.pin = await bcrypt.hash(pin, salt);
    }

    const updatedEmployee = await EmployeeModel.findByIdAndUpdate(_id, updateData, { new: true });

    if (!updatedEmployee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    res.status(200).json({ message: 'Employee updated successfully', employee: updatedEmployee });
  } catch (error) {
    console.error('Error updating employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

exports.deleteEmployee = async (req, res) => {
  try {
    console.log(req.body);
    const data = req.body;

    for (let id of data.employeeIds) {
      const employee_id = await EmployeeModel.findByIdAndDelete(id);

      if (!employee_id) {
        throw new Error('Delete failed');
      }
    }

    res.json({ message: 'Delete Successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
