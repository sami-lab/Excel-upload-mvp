const { promisify } = require('util');
const jwt = require('jsonwebtoken');
const User = require('../Models/userModel');

const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

//To Check whether user is login or not
module.exports = catchAsync(async (req, res, next) => {
  //1 getting Token and check if there
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in', 401));
  }
  //verifying Token
  const decoded = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  //checking User Really Exist
  const freshUser = await User.findById(decoded.id);
  if (!freshUser)
    return next(
      new AppError('The User Belonging to this Token does no longer Exist', 401)
    );

  req.user = freshUser;
  next(); //Allowing Access to
});
