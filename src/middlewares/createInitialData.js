const User = require('../models/user.model');
const bcrypt = require('bcryptjs');

const createInitialUserData = async () => {
  const initialData = {
    firstName: 'Jairo',
    lastName: 'Viana',
    email: 'jairo.visionam@gmail.com',
    role: 'admin',
    password: 'J@iro2919',
    homeAddress: 'Calle 17 20 87',
    phoneNumber: '573166520428',
  };

  const existingCustomer = await User.findOne({ email: initialData.email }).exec();

  if (!existingCustomer) {
    const user = new User({
      firstName: initialData.firstName,
      lastName: initialData.lastName,
      email: initialData.email,
      role: initialData.role,
      password: bcrypt.hashSync(initialData.password, 8),
      homeAddress: initialData.homeAddress,
      phoneNumber: initialData.phoneNumber,
    });

    await user.save();
  }
};

module.exports = createInitialUserData;
