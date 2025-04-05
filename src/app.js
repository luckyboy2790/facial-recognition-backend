const express = require("express");
const app = express();

const dashboardRoute = require("./routes/dashboard.route");

const userRoute = require("./routes/user.route");

const companyRoute = require("./routes/company.route");

const departmentRoute = require("./routes/department.route");

const jobTitileRoute = require("./routes/jobTitle.route");

const leaveTypeRoute = require("./routes/leaveType.route");

const leaveGroupRoute = require("./routes/leaveGroup.route");

const employeeRoute = require("./routes/employee.route");

const uploadRoutes = require("./routes/uploadRoutes");

const scheduleRoutes = require("./routes/schedule.route");

const attendanceRoutes = require("./routes/attendance.route");

const settingRoutes = require("./routes/setting.route");

const employeeLeaveRoutes = require("./routes/employeeLeave.route");

const { connectDB } = require("./config/connect");
const path = require("path");
const cors = require("cors");
const {
  createInitialUserData,
  createInitialSettingData,
} = require("./middlewares/createInitialData");
require("dotenv").config();
const PORT = process.env.PORT || 8080;

connectDB();

app.set("trust proxy", true);

createInitialUserData();

createInitialSettingData();

app.use(cors({}));
// app.use(
//   cors({
//     origin: [
//       "https://facial-recognition-frontend.vercel.app",
//       "http://localhost:5173",
//     ],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true,
//   })
// );

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  })
);
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

app.use((req, res, next) => {
  console.log(`\x1b[42m ${req.method} ${req.url} request received.\x1b[0m`);
  next();
});

app.use("/api/dashboard", dashboardRoute);

app.use("/api/user", userRoute);

app.use("/api/company", companyRoute);

app.use("/api/department", departmentRoute);

app.use("/api/job_title", jobTitileRoute);

app.use("/api/leave_type", leaveTypeRoute);

app.use("/api/leave_group", leaveGroupRoute);

app.use("/api/employee", employeeRoute);

app.use("/api/upload-image", uploadRoutes);

app.use("/api/schedule", scheduleRoutes);

app.use("/api/attendance", attendanceRoutes);

app.use("/api/setting", settingRoutes);

app.use("/api/leave", employeeLeaveRoutes);

app.use("/api/face", require("./routes/face-register.route"));

app.get("*", (req, res) => {
  res.status(404).send("404! This is an invalid URL.");
});

app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});
