const Group = require("../models/Group");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

exports.createGroup = catchAsync(async (req, res, next) => {
  const { name } = req.body;

  const group = await Group.create({
    name,
    admins: [req.user._id],
    members: [req.user._id],
    permissions: { canPost: [req.user._id] },
  });

  res.status(201).json({ status: "success", data: { group } });
});

exports.getAllGroups = catchAsync(async (req, res, next) => {
  const groups = await Group.find()
    .populate("admins", "username")
    .populate("members", "username")
    .populate("permissions.canPost", "username");

  res
    .status(200)
    .json({ status: "success", results: groups.length, data: { groups } });
});

exports.getGroup = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id)
    .populate("admins", "username")
    .populate("members", "username")
    .populate("permissions.canPost", "username");

  if (!group) return next(new AppError("Group not found", 404));
  res.status(200).json({ status: "success", data: { group } });
});

exports.addMember = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError("Group not found", 404));

  const { userId } = req.body;

  if (!group.members.includes(userId)) {
    group.members.push(userId);
    await group.save();
  }

  res.status(200).json({ status: "success", data: { group } });
});

exports.removeMember = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError("Group not found", 404));

  const { userId } = req.body;

  group.members = group.members.filter((m) => m.toString() !== userId);
  group.admins = group.admins.filter((a) => a.toString() !== userId);
  group.permissions.canPost = group.permissions.canPost.filter(
    (p) => p.toString() !== userId,
  );

  await group.save();
  res.status(200).json({ status: "success", data: { group } });
});

exports.grantPostPermission = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError("Group not found", 404));

  const { userId } = req.body;

  if (!group.permissions.canPost.includes(userId)) {
    group.permissions.canPost.push(userId);
    await group.save();
  }

  res.status(200).json({ status: "success", data: { group } });
});

exports.revokePostPermission = catchAsync(async (req, res, next) => {
  const group = await Group.findById(req.params.id);
  if (!group) return next(new AppError("Group not found", 404));

  const { userId } = req.body;

  group.permissions.canPost = group.permissions.canPost.filter(
    (p) => p.toString() !== userId,
  );
  await group.save();

  res.status(200).json({ status: "success", data: { group } });
});
