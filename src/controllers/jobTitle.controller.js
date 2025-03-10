const JobTitleModel = require('../models/jobTitile.model');

exports.createJobTitle = async (req, res) => {
  try {
    console.log(req.body);

    const newJobTitle = new JobTitleModel({
      job_title: req.body.jobTitle,
      department_id: req.body.departmentId,
    });

    const jobTitleId = await newJobTitle.save();

    res.json({ message: 'Create Success', job_title: jobTitleId });
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

    let matchStage = {};

    if (query) {
      matchStage = {
        $or: [
          { job_title: { $regex: query, $options: 'i' } },
          { 'department.department_name': { $regex: query, $options: 'i' } },
        ],
      };
    }

    let sortOption = {};
    if (sort && sort.key) {
      sortOption[sort.key] = sort.order === 'desc' ? -1 : 1;
    } else {
      sortOption = { createdAt: -1 };
    }

    const aggregatedData = await JobTitleModel.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchStage,
      },
      {
        $project: {
          _id: 1,
          job_title: 1,
          department_name: '$department.department_name',
        },
      },
      { $sort: sortOption },
      { $skip: (pageIndex - 1) * pageSize },
      { $limit: pageSize },
    ]);

    const totalCount = await JobTitleModel.aggregate([
      {
        $lookup: {
          from: 'departments',
          localField: 'department_id',
          foreignField: '_id',
          as: 'department',
        },
      },
      {
        $unwind: {
          path: '$department',
          preserveNullAndEmptyArrays: true,
        },
      },
      {
        $match: matchStage,
      },
      {
        $count: 'total',
      },
    ]);

    res.json({
      message: 'success',
      list: aggregatedData,
      total: totalCount.length > 0 ? totalCount[0].total : 0,
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

    for (let id of data.jobTitles) {
      const jobTitle_id = await JobTitleModel.findByIdAndDelete(id);

      if (!jobTitle_id) {
        throw new Error('Delete failed');
      }
    }

    res.json({ message: 'Delete Successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: error.message });
  }
};
