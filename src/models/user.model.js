const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const userSchema = new Schema({
  firstName: {
    type: String,
    required: [true, 'FullName not provided '],
  },
  lastName: {
    type: String,
    required: [true, 'FullName not provided '],
  },
  phoneNumber: {
    type: String,
    required: true,
  },
  homeAddress: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    unique: [true, 'Email already exists in database!'],
    lowercase: true,
    trim: true,
    required: [true, 'Email not provided'],
    validate: {
      validator: function (v) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      },
      message: '{VALUE} is not a valid email!',
    },
  },
  role: {
    type: String,
    enum: ['customer', 'admin'],
    required: [true, 'Please specify user role'],
  },
  password: {
    type: String,
    required: true,
  },
  created: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model('User', userSchema);
