const UserPermissionModel = require('../models/permission.model');

exports.createPermission = async (req, res) => {
  try {
    console.log(req.body);

    const { name, status, accessRight } = req.body;

    const newPermission = new UserPermissionModel({
      role_name: name,
      role_status: status,
      accessRight: accessRight,
    });

    await newPermission.save();

    res.status(200).json({ message: 'Create successfully' });
  } catch (error) {
    console.log(error);

    res.status(500).json({ message: error });
  }
};
