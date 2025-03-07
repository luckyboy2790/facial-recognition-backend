const express = require('express');
const app = express();
const userRoute = require('./routes/user.route');
const companyRoute = require('./routes/company.route');
const departmentRoute = require('./routes/department.route');
const jobTitileRoute = require('./routes/jobTitle.route');
const { connectDB } = require('./config/connect');
const path = require('path');
const cors = require('cors');
const createInitialUserData = require('./middlewares/createInitialData');
require('dotenv').config();
const PORT = process.env.PORT || 8080;

connectDB();

app.set('trust proxy', true);

app.use(cors({}));
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

createInitialUserData();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use((req, res, next) => {
  console.log(`\x1b[42m ${req.method} ${req.url} request received.\x1b[0m`);
  next();
});

app.use('/api/user', userRoute);
app.use('/api/company', companyRoute);
app.use('/api/department', departmentRoute);
app.use('/api/job_title', jobTitileRoute);

app.get('*', (req, res) => {
  res.status(404).send('404! This is an invalid URL.');
});

app.listen(PORT, () => {
  console.log(`Server is live on port ${PORT}`);
});
