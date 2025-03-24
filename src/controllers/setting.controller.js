const SettingModel = require("../models/setting.model");
const EmployeeModel = require("../models/employee.model");
const UserModel = require("../models/user.model");

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
