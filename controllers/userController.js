const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find().select("-password");
  res
    .status(200)
    .json({ status: "success", results: users.length, data: { users } });
});

exports.getUser = catchAsync(async (req, res, next) => {
  const user = await User.findById(req.params.id).select("-password");
  if (!user) return next(new AppError("User not found", 404));
  res.status(200).json({ status: "success", data: { user } });
});

exports.updateUser = catchAsync(async (req, res, next) => {
  if (req.body.password) {
    return next(new AppError("Use password reset for updating password", 400));
  }

  const user = await User.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).select("-password");

  if (!user) return next(new AppError("User not found", 404));
  res.status(200).json({ status: "success", data: { user } });
});

exports.deleteUser = catchAsync(async (req, res, next) => {
  const user = await User.findByIdAndDelete(req.params.id);
  if (!user) return next(new AppError("User not found", 404));
  res.status(204).json({ status: "success", data: null });
});
