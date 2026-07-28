const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { upload } = require("../middleware/uploadMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const {
  createPostSchema,
  updatePostSchema,
} = require("../validators/postValidator");
const {
  createPost,
  getAllPosts,
  getUserPosts,
  getPost,
  updatePost,
  deletePost,
} = require("../controllers/postController");

router.use(protect);

router
  .route("/")
  .get(getAllPosts)
  .post(upload.array("images", 5), validate(createPostSchema), createPost);

router.get("/user/:userId", getUserPosts);

router
  .route("/:id")
  .get(getPost)
  .patch(validate(updatePostSchema), updatePost)
  .delete(deletePost);

module.exports = router;
