const User = require("../models/user-model");
const { AppError } = require("../utils/app-error");
const { asyncHandler } = require("../utils/async-handler");
const jwt = require("jsonwebtoken");
const { promisify } = require("node:util");

const login = async (req, res, next) => {
  const { username, password } = req.body;

  const user = await User.findOne({ username });
  if (!user) {
    return next(new AppError(401, "username or password is not valid{username}"));
  }

  const isPasswordMatch = await user.comparePassword(password);
  if (!isPasswordMatch) {
    return next(new AppError(401, "username or password is not valid {password}"));
  }

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });

  res.status(200).json({ status: "success", data: { user }, token });
};

const checkSignUpData = async (req, res, next) => {
  const { username, email } = req.body;

  const usernameExists = await User.exists({ username });
  if (!!usernameExists) {
    return next(new AppError(409, "this username is already exist"));
  }

  const emailExists = await User.exists({ email });
  if (!!emailExists) {
    return next(new AppError(409, "this email is already exist"));
  }

  next();
};

const signup = async (req, res, next) => {
  const { firstname, lastname, gender, username, email, password } = req.body;
  const user = await User.create({
    firstname,
    lastname,
    gender,
    username,
    password,
    email,
    role: "employee",
  });

  res.status(201).json({
    status: "success",
    data: { user },
  });
};

const protect = async (req, res, next) => {
  if (!req?.headers?.authorization && req?.headers?.authorization?.startsWith("Bearer")) {
    return next(new AppError(401, "you are not logged in"));
  }

  const token = req.headers.authorization.split(" ").at(1);

  const decode = await promisify(jwt.verify)(token, process.env.JWT_SECRET);

  const currentUser = await User.findById(decode.id).select(
    "id username firstname lastname gender email"
  );
  if (!currentUser) {
    return next(new AppError(401, "the user blong to this token not exist"));
  }

  if (currentUser.changedPasswordAfter(decode.iat)) {
    return next(
      new AppError(401, "password has been changed please try to login atfirst")
    );
  }
  req.user = currentUser;

  next();
};

const restrictTo = (...roles) => {
  return asyncHandler(async (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return next(new AppError(403, "you do not have permission to perform this action"));
    }

    next();
  });
};

const logout = (req, res, next) => {
  res.status(204).json({
    status: "success",
    data: null,
  });
};

module.exports = {
  login,
  signup,
  checkSignUpData,
  logout,
  protect,
  restrictTo,
};
