const mongoose = require('mongoose');
const Schema = mongoose.Schema;

/**
 * User Schema
 */
const userPermissionSchema = new Schema({
  role_name: {
    type: String,
    required: [true, 'Role Name not provided'],
  },
  role_status: {
    type: String,
    required: [true, 'Role Status not provided'],
  },
  accessRight: {
    type: Schema.Types.Mixed,
    required: true,
    default: {},
  },
});

module.exports = mongoose.model('UserPermission', userPermissionSchema);
