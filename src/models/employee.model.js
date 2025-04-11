const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * Employee Schema
 */
const EmployeeSchema = new Schema({
  first_name: {
    type: String,
    required: [true, "First Name not provided"],
  },
  last_name: {
    type: String,
    required: [true, "First Name not provided"],
  },
  full_name: {
    type: String,
  },
  email: {
    type: String,
    required: [true, "Email not provided"],
    unique: true,
  },
  dial_code: {
    type: String,
  },
  phone_number: {
    type: String,
  },
  img: {
    type: String,
  },
  face_info: {
    name: {
      type: String,
    },
    descriptors: {
      type: [[Number]],
    },
  },
  address: {
    type: String,
  },
  gender: {
    type: String,
    enum: ["MALE", "FEMALE", "OTHER"],
  },
  civil_status: {
    type: String,
  },
  height: {
    type: String,
  },
  weight: {
    type: String,
  },
  age: {
    type: String,
  },
  birthday: {
    type: String,
  },
  national_id: {
    type: String,
  },
  place_of_birth: {
    type: String,
  },
  company_id: {
    type: Schema.Types.ObjectId,
    ref: "Company",
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: "Department",
  },
  job_title_id: {
    type: Schema.Types.ObjectId,
    ref: "JobTitle",
  },
  pin: {
    type: String,
  },
  company_email: {
    type: String,
  },
  leave_group_id: {
    type: Schema.Types.ObjectId,
    ref: "LeaveGroup",
  },
  employee_type: {
    type: String,
  },
  employee_status: {
    type: String,
    enum: ["Active", "Archived"],
    default: "Active",
  },
  official_start_date: {
    type: String,
  },
  date_regularized: {
    type: String,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Employee", EmployeeSchema);
