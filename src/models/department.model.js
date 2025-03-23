const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const departmentSchema = new Schema({
  department_name: {
    type: String,
    required: [true, "Department Name not provided"],
  },
  company: {
    type: Schema.Types.ObjectId,
    required: [true, "Company not provided"],
  },
});

module.exports = mongoose.model("Department", departmentSchema);
