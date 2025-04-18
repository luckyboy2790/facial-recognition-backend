const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const JobTitleSchema = new Schema({
  job_title: {
    type: String,
    required: [true, "Job title not provided"],
  },
  department_id: {
    type: Schema.Types.ObjectId,
    required: [true, "JobTitle name not provided"],
  },
  company: {
    type: Schema.Types.ObjectId,
    required: [true, "Company not provided"],
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Job_title", JobTitleSchema);
