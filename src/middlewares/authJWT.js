const jwt = require('jsonwebtoken');
const User = require('../models/user.model');

const verifyToken = async (req, res, next) => {
  try {
    if (req.headers && req.headers.authorization) {
      const token = req.headers.authorization.split(' ')[1];
      const decoded = jwt.verify(token, process.env.API_SECRET);

      const user = await User.findOne({ _id: decoded.id }).exec();
      if (!user) {
        return res.status(404).send({ message: 'User not found' });
      }

      req.user = user;
      next();
    } else {
      req.user = undefined;
      next();
    }
  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).send({ message: 'Invalid token' });
    }
    res.status(500).send({ message: 'Internal server error' });
  }
};

module.exports = verifyToken;
