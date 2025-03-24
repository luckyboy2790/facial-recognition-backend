const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const EmployeeModel = require("../models/employee.model");

exports.signup = (req, res) => {
  const { employee, email, status, account_type, role, password } = req.body;
  const user = new User({
    employee,
    email,
    status,
    account_type,
    role,
    password: bcrypt.hashSync(password, 8),
  });

  user
    .save()
    .then(() => {
      res.status(200).send({
        message: "User Registered successfully",
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err,
      });
      return;
    });
};

exports.signin = (req, res) => {
  User.findOne({
    email: req.body.email,
  })
    .exec()
    .then(async (user) => {
      if (!user) {
        return res.status(404).send({
          message: "User Not found.",
        });
      }

      var passwordIsValid = bcrypt.compareSync(
        req.body.password,
        user.password
      );

      if (!passwordIsValid) {
        return res.status(401).send({
          accessToken: null,
          message: "Invalid Password!",
        });
      }

      const expiresIn = 86400;

      var token = jwt.sign(
        {
          id: user._id,
          email: user.email,
        },
        process.env.API_SECRET,
        {
          expiresIn,
        }
      );

      const expiresAt = new Date(Date.now() + expiresIn * 1000);

      const employeeData = await EmployeeModel.findById(user.employee);

      res.status(200).send({
        user: {
          _id: user._id,
          email: user.email,
          full_name: employeeData?.full_name,
          account_type: user.account_type,
          img: employeeData?.img || null,
          company: employeeData.company_id || null,
        },
        message: "Login successfull",
        accessToken: token,
        expires_at: expiresAt.toISOString(),
      });
    })
    .catch((err) => {
      res.status(500).send({
        message: err,
      });
      return;
    });
};
