const mongoose = require("mongoose");
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const companySchema = new Schema({
  company_name: {
    type: String,
    required: [true, "Company Name not provided"],
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Company", companySchema);
