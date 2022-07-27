const crypto = require("crypto");
const jwt = require("jsonwebtoken");
const User = require("../Models/userModel");

const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Email = require("../utils/emails");
const Transaction = require("../Models/transactionModel");

const createLoginToken = async (user, statusCode, req, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000
    ),
    // secure: true,//only https
    httpOnly: true, //to prevent xss
    secure: req.secure || req.headers["x-forwarded-proto"] === "https",
  };
  if (process.env.NODE_ENV === "production") cookieOptions.secure = true;
  res.cookie("jwt", token, cookieOptions);
  user.password = undefined; //not saving
  user.emailVerified = undefined;
  const transactions = await Transaction.find({ user: user._id });

  res.status(statusCode).json({
    status: "success",
    token,
    data: {
      user,
      transactions,
    },
  });
};

//This route is only for User Registeration
exports.signUp = catchAsync(async (req, res, next) => {
  let newUser = {
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
    confirmPassword: req.body.confirmPassword,
  };

  newUser = await User.create(newUser);
  //Generate Random Token
  const verifcationToken = newUser.createEmailVerificationToken();
  await newUser.save({ validateBeforeSave: false }); //Saving only 2 Fields

  //Sending Email
  const url = process.env.APP_URL + "/verifyUser/" + verifcationToken;
  console.log(url);
  try {
    await new Email(newUser, url).sendEmailVerification();
    res.status(200).json({
      status: "success",
      message: "Token Sent to Email",
    });
  } catch (err) {
    await User.findByIdAndDelete(newUser._id);
    return next(
      new AppError("There was an error sending an email, Try Again Later", 500)
    );
  }
});

exports.verifyEmail = catchAsync(async (req, res, next) => {
  //Comparing Token
  const hashToken = crypto
    .createHash("sha256")
    .update(req.params.token)
    .digest("hex");
  const user = await User.findOne({
    emailVerificationToken: hashToken,
    emailVerificationExpires: { $gt: Date.now() },
  });
  if (!user) return next(new AppError("Token is Invalid or expired", 400));
  //Updating Field if there token verifies
  user.emailVerified = true;
  user.emailVerificationToken = undefined;
  user.emailVerificationExpires = undefined;
  await user.save({ validateBeforeSave: false });

  const homepage = `${req.protocol}://${req.get("host")}/`;
  try {
    await new Email(user, homepage, homepage).sendWelcome();
    //await new Email(newUser, url).sendWelcome();
    res.status(200).json({
      status: "success",
      message: "Email Veification Sucessful! Login To continue",
    });
  } catch (err) {
    console.log(err);
    return next(
      new AppError("There was an error sending an email, Try Again Later", 500)
    );
  }
});

exports.validateUser = catchAsync(async (req, res, next) => {
  const doc = await Transaction.find({ user: req.user.id });
  res.status(200).json({
    status: "success",
    data: {
      user: req.user,
      transactions: doc,
    },
  });
});
exports.login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return next(new AppError("Please Provide Email and password", 400));
  }
  const user = await User.findOne({ email })
    .select("+password")
    .select("+emailVerified");
  console.log(email, password, "--------------", user);
  //Comparing password
  if (!user || !(await user.correctPassword(password, user.password))) {
    console.log("log");
    return next(new AppError("Incorrect Email or password", 401));
  } else if (!user || user.emailVerified === false) {
    return next(new AppError("Email not verified yet", 401));
  }
  createLoginToken(user, 200, req, res);
});
