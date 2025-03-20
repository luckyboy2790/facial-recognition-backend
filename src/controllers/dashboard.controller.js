const CompanyModel = require('../models/company.model');
const DepartmentModel = require('../models/department.model');
const JobTitleModel = require('../models/jobTitile.model');
const LeaveGroupModel = require('../models/leaveGroup.model');
const EmployeeModel = require('../models/employee.model');
const UserModel = require('../models/user.model');

exports.getDashboardDataByAdmin = async (req, res) => {
  try {
    console.log(req.user);

    const companyId = req.user.employeeData.company_id
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
