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

exports.updateRole = async (req, res) => {
  try {
    console.log(req.body);

    const { id } = req.params;

    const { name, status, accessRight } = req.body;

    await UserRoleModel.findByIdAndUpdate(id, {
      name: name,
      status: status,
      accessRight: accessRight,
    });

    res.status(200).json({ message: 'Update successfully' });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error });
  }
};

exports.deleteRole = async (req, res) => {
  try {
    const { id } = req.params;

    await UserRoleModel.findByIdAndDelete(id);

    res.status(200).json({ message: 'Delete successfully' });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
