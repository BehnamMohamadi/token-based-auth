const User = require("../models/user-model");
const { AppError } = require("../utils/app-error");
const { getIranProvinces } = require("../utils/iran-provinces");

const getUserAccount = async (req, res, next) => {
  console.log(req.user);
  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
};

const editUserAccount = async (req, res, next) => {
  const {
    firstname = null,
    lastname = null,
    email = null,
    gender = null,
    username = null,
  } = req.body;

  const duplicateUsername = await User.findOne({
    username,
    _id: { $ne: req.user._id },
  });
  if (!!duplicateUsername) {
    return next(
      new AppError(409, "username is already exists, use a different username")
    );
  }

  const duplicateEmail = await User.findOne({
    email,
    _id: { $ne: req.user._id },
  });
  if (!!duplicateEmail) {
    return next(new AppError(409, "email is already exists, use a different email"));
  }

  req.user.firstname = firstname ?? req.user.firstname;
  req.user.lastname = lastname ?? req.user.lastname;
  req.user.username = username ?? req.user.username;
  req.user.email = email ?? req.user.email;
  req.user.gender = gender ?? req.user.gender;

  await req.user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
};

const deleteUserAccount = async (req, res, next) => {
  res.status(204).json({
    status: "success",
    data: null,
  });
};

const changePassword = async (req, res, next) => {
  const { currentPassword, newPassword } = req.body;

  const isCurrentPasswordMatch = await req.user.comparePassword(currentPassword);
  if (!isCurrentPasswordMatch) {
    return next(new AppError(400, "your current password is not match"));
  }

  req.user.password = newPassword;
  await req.user.save({ validateModifiedOnly: true });

  res.status(200).json({
    status: "success",
    data: { user: req.user },
  });
};

const userCompletelyData = async (req, res, next) => {
  const completeDataOfUser = await User.findById(req.user._id).select(
    "dateOfBirth phonenumber province"
  );

  const { dateOfBirth = null, phonenumber = [], province = null } = req.body;

  if (!!province && province !== "not-found") {
    const iranProvinces = await getIranProvinces();
    if (!iranProvinces.includes(province)) {
      return next(new AppError(409, "provide iran provinces"));
    }
  }

  const users = await User.find({
    _id: { $ne: req.user._id },
  });

  const checkPhoneNumberIsExist = users.some((user) =>
    user.phonenumber.some((phone) => phonenumber.includes(phone))
  );
  if (checkPhoneNumberIsExist) {
    return next(new AppError(409, "one of the phone numbers already exists"));
  }

  completeDataOfUser.dateOfBirth = dateOfBirth ?? completeDataOfUser.dateOfBirth;
  completeDataOfUser.phonenumber = phonenumber.length
    ? phonenumber
    : completeDataOfUser.phonenumber;
  completeDataOfUser.province = province ?? completeDataOfUser.province;

  await completeDataOfUser.save({ validateModifiedOnly: true });

  res.status(200).json({ status: "success", data: { user: completeDataOfUser } });
};

module.exports = {
  changePassword,
  getUserAccount,
  editUserAccount,
  deleteUserAccount,
  userCompletelyData,
};
