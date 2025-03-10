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

    const newEmployee = new EmployeeModel({
      first_name: firstName,
      last_name: lastName,
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
      pin,
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
