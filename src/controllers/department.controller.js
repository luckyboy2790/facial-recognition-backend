const DepartmentModel = require("../models/department.model");

exports.createDepartment = async (req, res) => {
  try {
    const { departmentName, company } = req.body;

    const newDepartment = new DepartmentModel({
      department_name: departmentName,
      company: company ? company : req.user.employeeData.company_id,
    });

    const departmentId = await newDepartment.save();

    res.json({ message: "Create Success", department: departmentId });
  } catch (error) {
    console.log(error);
  }
};

exports.getDepartment = async (req, res) => {
  try {
    let { pageIndex, pageSize, query, sort } = req.query;

    pageIndex = parseInt(pageIndex) || 1;
    pageSize = parseInt(pageSize) || 10;

    let filter = query
      ? { department_name: { $regex: query, $options: "i" } }
      : {};

    if (req.user.account_type === "Admin") {
      filter.company = req.user.employeeData.company_id;
    }

    let sortOption = {};
    if (sort && sort.key) {
      if (sort.key === "company_name") {
        sortOption["companyData.company_name"] = sort.order === "desc" ? -1 : 1;
      } else {
        sortOption[sort.key] = sort.order === "desc" ? -1 : 1;
      }
    } else {
      sortOption["department_name"] = 1;
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

    const departments = await DepartmentModel.aggregate(pipeline);

    const totalDepartments = await DepartmentModel.countDocuments(filter);

    res.json({
      message: "success",
      list: departments,
      total: totalDepartments,
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
        throw new Error("Delete failed");
      }
    }

    res.json({ message: "Delete Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
