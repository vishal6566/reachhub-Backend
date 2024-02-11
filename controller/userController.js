const User = require("../model/userModel");
const catchAsyncHandler = require("../middlewares/catchAsyncHandles");

const ErrorHandler = require("../utils/errorhandler");
const sendToken = require("../utils/jwtToken");
//Register a user

exports.registerUser = catchAsyncHandler(async (req, res, next) => {
  const { name, email, password } = req.body;

  const user = await User.create({
    name,
    email,
    password,
  });

  sendToken(user, 201, res);
});

//login a user

exports.loginUser = catchAsyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  if (!email || !password) {
    next(new ErrorHandler("Please Enter email & password", 400));
  }
  //checking if user has given both email and password

  const user = await User.findOne({ email }).select("+password");

  if (!user) {
    next(new ErrorHandler("Invalid email or password", 401));
  }

  const isPasswordMatched = await user.comparePassword(password);

  if (!isPasswordMatched) {
    return next(new ErrorHandler("Invalid email or password", 401));
  }
  sendToken(user, 201, res);
});

//logout user

exports.logoutUser = catchAsyncHandler(async (req, res, next) => {
  res.cookie("token", null, {
    httpOnly: true,
    expires: new Date(Date.now()),
  });

  res.status(200).json({
    success: true,
    message: "Logged Out Successfully",
  });
});
