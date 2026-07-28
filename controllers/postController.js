const Post = require("../models/Post");
const Group = require("../models/Group");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");
const { uploadToImageKit } = require("../middleware/uploadMiddleware");

exports.createPost = catchAsync(async (req, res, next) => {
  const { title, content, group } = req.body;
  const author = req.user._id;

  if (group) {
    const groupDoc = await Group.findById(group);
    if (!groupDoc) return next(new AppError("Group not found", 404));

    const isAllowed =
      req.user.role === "super-admin" ||
      groupDoc.admins.includes(author) ||
      groupDoc.permissions.canPost.includes(author);

    if (!isAllowed) {
      return next(
        new AppError("You are not allowed to post in this group", 403),
      );
    }
  }

  let images = [];
  if (req.files && req.files.length > 0) {
    const uploadPromises = req.files.map((file) => uploadToImageKit(file));
    images = await Promise.all(uploadPromises);
  }

  const post = await Post.create({
    title,
    content,
    author,
    group: group || null,
    images,
  });

  res.status(201).json({ status: "success", data: { post } });
});

exports.getAllPosts = catchAsync(async (req, res, next) => {
  const userId = req.user._id;
  const userRole = req.user.role;

  let query = {};

  if (userRole !== "super-admin") {
    const userGroups = await Group.find({
      $or: [
        { admins: userId },
        { members: userId },
        { "permissions.canPost": userId },
      ],
    }).select("_id");

    const groupIds = userGroups.map((g) => g._id);

    query = {
      $or: [{ group: null }, { group: { $in: groupIds } }, { author: userId }],
    };
  }

  const posts = await Post.find(query)
    .populate("author", "username email")
    .populate("group", "name")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ status: "success", results: posts.length, data: { posts } });
});

exports.getUserPosts = catchAsync(async (req, res, next) => {
  const posts = await Post.find({ author: req.params.userId })
    .populate("author", "username")
    .populate("group", "name")
    .sort({ createdAt: -1 });

  res
    .status(200)
    .json({ status: "success", results: posts.length, data: { posts } });
});

exports.getPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id)
    .populate("author", "username email")
    .populate("group", "name");

  if (!post) return next(new AppError("Post not found", 404));
  res.status(200).json({ status: "success", data: { post } });
});

exports.updatePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  const isOwner = post.author.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.role === "super-admin";

  if (!isOwner && !isSuperAdmin) {
    return next(new AppError("You can only edit your own posts", 403));
  }

  const updatedPost = await Post.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ status: "success", data: { post: updatedPost } });
});

exports.deletePost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.params.id);
  if (!post) return next(new AppError("Post not found", 404));

  const isOwner = post.author.toString() === req.user._id.toString();
  const isSuperAdmin = req.user.role === "super-admin";

  if (!isOwner && !isSuperAdmin) {
    return next(new AppError("You can only delete your own posts", 403));
  }

  await Post.findByIdAndDelete(req.params.id);
  res.status(204).json({ status: "success", data: null });
});
