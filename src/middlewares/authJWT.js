const jwt = require("jsonwebtoken");
const User = require("../models/user.model");

const verifyToken = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(" ")[1];

      const decoded = jwt.verify(token, process.env.API_SECRET);

      const user = await User.findOne({
        $or: [{ _id: decoded.id }, { email: decoded.email }],
      }).exec();

      if (!user) {
        return res.status(404).send({ message: "User not found" });
      }

      const userWithEmployeeData = await User.aggregate([
        {
          $match: {
            $or: [{ _id: decoded.id }, { email: decoded.email }],
          },
        },
        {
          $lookup: {
            from: "employees",
            localField: "employee",
            foreignField: "_id",
            as: "employeeData",
          },
        },
        {
          $unwind: {
            path: "$employeeData",
            preserveNullAndEmptyArrays: true,
          },
        },
      ]);

      req.user = userWithEmployeeData[0];

      next();
    } else {
      req.user = undefined;
      next();
    }
  } catch (err) {
    console.error(err);
    if (err.name === "JsonWebTokenError") {
      return res.status(401).send({ message: "Invalid token" });
    }
    res.status(500).send({ message: "Internal server error" });
  }
};

module.exports = verifyToken;
