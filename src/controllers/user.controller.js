const UserRoleModel = require('../models/role.model');

exports.createRole = async (req, res) => {
  try {
    console.log(req.body);

    const { name, status, accessRight } = req.body;

    const newRole = new UserRoleModel({
      name: name,
      status: status,
      accessRight: accessRight,
    });

    await newRole.save();

    res.status(200).json({ message: 'Create successfully' });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error });
  }
};

exports.getRole = async (req, res) => {
  try {
    console.log(req.query);

    const roleList = await UserRoleModel.find({});

    res.status(200).send({ message: 'Fetch Role Data successfully', roleList });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
