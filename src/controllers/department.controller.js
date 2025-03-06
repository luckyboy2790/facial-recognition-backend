const DepartmentModel = require('../models/department.model');

exports.createDepartment = async (req, res) => {
  try {
    console.log(req.body);

    const newDepartment = new DepartmentModel({
      department_name: req.body.departmentName,
    });

    const departmentId = await newDepartment.save();

    res.json({ message: 'Create Success', department: departmentId });
  } catch (error) {
    console.log(error);
  }
};

exports.getDepartment = async (req, res) => {
  try {
    console.log(req.query);

    let { pageIndex, pageSize, query, sort } = req.query;

    pageIndex = parseInt(pageIndex) || 1;
    pageSize = parseInt(pageSize) || 10;

    const filter = query ? { department_name: { $regex: query, $options: 'i' } } : {};

    let sortOption = {};
    if (sort && sort.key) {
      sortOption[sort.key] = sort.order === 'desc' ? -1 : 1;
    }

    const companies = await DepartmentModel.find(filter)
      .sort(sortOption)
      .skip((pageIndex - 1) * pageSize)
      .limit(pageSize);

    const totalCompanies = await DepartmentModel.countDocuments(filter);

    res.json({
      message: 'success',
      list: companies,
      total: totalCompanies,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};

exports.deleteDepartment = async (req, res) => {
  try {
    console.log(req.body);
    const data = req.body;

    for (let id of data.companies) {
      const department_id = await DepartmentModel.findByIdAndDelete(id);

      if (!department_id) {
        throw new Error('Delete failed');
      }
    }

    res.json({ message: 'Delete Successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
