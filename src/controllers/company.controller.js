const CompanyModel = require('../models/company.model');

exports.createCompany = async (req, res) => {
  try {
    console.log(req.body);

    const newCompany = new CompanyModel({
      company_name: req.body.companyName,
    });

    const companyId = await newCompany.save();

    res.json({ message: 'Create Success', company: companyId });
  } catch (error) {
    console.log(error);
  }
};

exports.getCompany = async (req, res) => {
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

    const companies = await CompanyModel.find(filter)
      .sort(sortOption)
      .skip((pageIndex - 1) * pageSize)
      .limit(pageSize);

    const totalCompanies = await CompanyModel.countDocuments(filter);

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

exports.deleteCompany = async (req, res) => {
  try {
    console.log(req.body);
    const data = req.body;

    for (let id of data.companies) {
      const company_id = await CompanyModel.findByIdAndDelete(id);

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
