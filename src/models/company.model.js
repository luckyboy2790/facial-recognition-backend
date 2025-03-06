const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const companySchema = new Schema({
  company_name: {
    type: String,
    required: [true, 'Company Name not provided'],
  },
});

module.exports = mongoose.model('Company', companySchema);
