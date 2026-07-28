const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const { restrictTo } = require("../middleware/authorizeMiddleware");
const { validate } = require("../middleware/validateMiddleware");
const {
  createGroupSchema,
  manageUserSchema,
} = require("../validators/groupValidator");
const {
  createGroup,
  getAllGroups,
  getGroup,
  addMember,
  removeMember,
  grantPostPermission,
  revokePostPermission,
} = require("../controllers/groupController");

router.use(protect);

router
  .route("/")
  .get(getAllGroups)
  .post(
    restrictTo("admin", "super-admin"),
    validate(createGroupSchema),
    createGroup,
  );

router.route("/:id").get(getGroup);

router
  .route("/:id/members")
  .post(
    restrictTo("admin", "super-admin"),
    validate(manageUserSchema),
    addMember,
  )
  .delete(
    restrictTo("admin", "super-admin"),
    validate(manageUserSchema),
    removeMember,
  );

router
  .route("/:id/permissions")
  .post(
    restrictTo("admin", "super-admin"),
    validate(manageUserSchema),
    grantPostPermission,
  )
  .delete(
    restrictTo("admin", "super-admin"),
    validate(manageUserSchema),
    revokePostPermission,
  );

module.exports = router;
