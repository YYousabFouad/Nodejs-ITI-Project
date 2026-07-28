const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/authorizeMiddleware");
const {
  getAllUsers,
  getUser,
  updateUser,
  deleteUser,
} = require("../controllers/userController");

router.use(protect);

router.route("/").get(restrictTo("admin", "super-admin"), getAllUsers);

router
  .route("/:id")
  .get(getUser)
  .patch(updateUser)
  .delete(restrictTo("admin", "super-admin"), deleteUser);

module.exports = router;
