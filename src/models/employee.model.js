const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * Employee Schema
 */
const EmployeeSchema = new Schema({
  full_name: {
    type: String,
    required: [true, 'First Name not provided'],
  },
  email: {
    type: String,
    required: [true, 'Email not provided'],
    unique: true,
  },
  dial_code: {
    type: String,
    required: [true, 'Dial Code not provided'],
  },
  phone_number: {
    type: String,
    required: [true, 'Phone Number not provided'],
  },
  img: {
    type: String,
    required: [true, 'User Image not provided'],
  },
  face_info: {
    name: {
      type: String,
      required: [true, 'Face name not provided'],
    },
    descriptors: {
      type: [[Number]], // Array of arrays containing numbers
      required: [true, 'Face descriptors not provided'],
    },
  },
  address: {
    type: String,
    required: [true, 'Address not provided'],
  },
  gender: {
    type: String,
    required: [true, 'Gender not provided'],
    enum: ['MALE', 'FEMALE', 'OTHER'],
  },
  civil_status: {
    type: String,
    required: [true, 'Civil Status not provided'],
  },
  height: {
    type: String,
    required: [true, 'Height not provided'],
  },
  weight: {
    type: String,
    required: [true, 'Weight not provided'],
  },
  age: {
    type: String,
    required: [true, 'Age not provided'],
  },
  birthday: {
    type: String,
    required: [true, 'Birthday not provided'],
  },
  national_id: {
    type: String,
    required: [true, 'National Id not provided'],
  },
  place_of_birth: {
    type: String,
    required: [true, 'Place of Birth not provided'],
  },
  company_id: {
    type: Schema.Types.ObjectId,
    ref: 'Company',
    required: [true, 'Company Id not provided'],
  },
  department_id: {
    type: Schema.Types.ObjectId,
    ref: 'Department',
    required: [true, 'Department Id not provided'],
  },
  job_title_id: {
    type: Schema.Types.ObjectId,
    ref: 'JobTitle',
    required: [true, 'Job Title Id not provided'],
  },
  pin: {
    type: String,
    required: [true, 'PIN not provided'],
  },
  company_email: {
    type: String,
    required: [true, 'Company Email not provided'],
  },
  leave_group_id: {
    type: Schema.Types.ObjectId,
    ref: 'LeaveGroup',
    required: [true, 'Leave Group not provided'],
  },
  employee_type: {
    type: String,
    required: [true, 'Employee Type not provided'],
  },
  employee_status: {
    type: String,
    required: [true, 'Employee Status not provided'],
    enum: ['Active', 'Archive'],
    default: 'Active',
  },
  official_start_date: {
    type: String,
    required: [true, 'Official Start Date not provided'],
  },
  date_regularized: {
    type: String,
    required: [true, 'Date Regularized not provided'],
  },
});

module.exports = mongoose.model('Employee', EmployeeSchema);
