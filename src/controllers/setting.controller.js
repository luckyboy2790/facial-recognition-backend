const SettingModel = require("../models/setting.model");
const EmployeeModel = require("../models/employee.model");
const UserModel = require("../models/user.model");
const bcrypt = require("bcryptjs");

exports.setSetting = async (req, res) => {
  try {
    console.log(req.body);
    const {
      country,
      timezone,
      timeFormat,
      rfidClock,
      timeInComments,
      ipRestriction,
    } = req.body;

    const { id } = req.params;

    if (id && id !== "undefined") {
      await SettingModel.findByIdAndUpdate(id, {
        country,
        timezone,
        timeFormat,
        rfidClock,
        timeInComments,
        ipRestriction,
      });
    } else {
      const settingModel = new SettingModel({
        country,
        timezone,
        timeFormat,
        rfidClock,
        timeInComments,
        ipRestriction,
      });

      await settingModel.save();
    }

    res.status(200).json({ message: "Create successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.getSetting = async (req, res) => {
  try {
    const settingData = await SettingModel.find({});

    res.status(200).json({
      message: "Fetch data successfully",
      settingData: settingData[0],
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.accountSetting = async (req, res) => {
  try {
    console.log(req.body);
    const { first_name, last_name, email } = req.body;

    const { id } = req.params;

    const userData = await UserModel.findById(id);

    const user = await UserModel.findByIdAndUpdate(id, {
      email: email,
    });

    const userEmployeeId = userData.employee;

    console.log(userData);

    const employee = await EmployeeModel.findByIdAndUpdate(userEmployeeId, {
      first_name: first_name,
      last_name: last_name,
      full_name: `${first_name} ${last_name}`,
      email: email,
    });

    const userResponse = {
      _id: id,
      email: email,
      full_name: `${first_name} ${last_name}`,
      account_type: user.account_type,
      img: employee?.img || null,
    };

    res
      .status(200)
      .json({ message: "Create successfully", user: userResponse });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    const { id } = req.params;

    const user = await UserModel.findById(id);

    let passwordIsValid = bcrypt.compareSync(currentPassword, user.password);

    if (!passwordIsValid) {
      return res.status(401).send({
        accessToken: null,
        message: "Invalid Password!",
      });
    }

    await UserModel.findByIdAndUpdate(id, {
      password: bcrypt.hashSync(newPassword, 8),
    });

    res.status(200).json({ message: "Change Password Successfully." });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: error.message });
  }
};
