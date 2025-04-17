//admin routes

const router = require("express").Router();
const { protect, restrictTo } = require("../controller/auth-controller");
const {
  getUserById,
  getAllUsers,
  addUser,
  editUserById,
  deleteUserById,
} = require("../controller/user-controller");
const { asyncHandler } = require("../utils/async-handler");

router.use(asyncHandler(protect), restrictTo("admin"));

router.get("/:userId", asyncHandler(getUserById));

router.get("/", asyncHandler(getAllUsers));

router.post("/", asyncHandler(addUser));

router.patch("/:userId", asyncHandler(editUserById));

router.delete(":/userId", asyncHandler(deleteUserById));

module.exports = router;
