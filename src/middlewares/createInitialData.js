const User = require("../models/user.model");
const EmployeeModel = require("../models/employee.model");
const SettingModel = require("../models/setting.model");
const bcrypt = require("bcryptjs");

const createInitialUserData = async () => {
  const initialEmployeeData = {
    first_name: "Jairo",
    last_name: "Viana",
    full_name: "Jairo Viana",
    email: "jairo.visionam@gmail.com",
    birthday: "1988-12-22",
  };

  const existingEmployee = await EmployeeModel.findOne({
    email: initialEmployeeData.email,
  });

  let employeeId = "";

  if (!existingEmployee) {
    const newEmployee = new EmployeeModel({
      first_name: initialEmployeeData.first_name,
      last_name: initialEmployeeData.last_name,
      full_name: initialEmployeeData.full_name,
      email: initialEmployeeData.email,
      birthday: initialEmployeeData.birthday,
    });

    employeeId = await newEmployee.save();
  }

  console.log(employeeId);

  const initialUserData = {
    email: "jairo.visionam@gmail.com",
    status: "Enabled",
    account_type: "SuperAdmin",
    password: "J@iro2919",
  };

  if (employeeId) initialUserData.employee = employeeId._id;
  else initialUserData.employee = existingEmployee._id;

  const existingCustomer = await User.findOne({
    email: initialUserData.email,
  }).exec();

  if (!existingCustomer) {
    const user = new User({
      employee: initialUserData.employee,
      email: initialUserData.email,
      status: initialUserData.status,
      password: bcrypt.hashSync(initialUserData.password, 8),
      account_type: initialUserData.account_type,
    });

    await user.save();
  }
};

const createInitialSettingData = async () => {
  try {
    const existSettingData = SettingModel.find({});

    if (existSettingData.length === 0) {
      const settingData = new SettingModel({
        country: "UK",
        timezone: "Europe/Lisbon",
        timeFormat: "1",
        rfidClock: false,
        timeInComments: false,
        ipRestriction: "",
      });

      await settingData.save();
    }
  } catch (error) {
    console.log(error);
  }
};

module.exports = { createInitialUserData, createInitialSettingData };
