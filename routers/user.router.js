const express = require("express");
const { register, login, fetchUsers, deleteUserById, getProfile } = require("../controllers/user.controller");
const { authenticate, isAdmin } = require("../auth/auth.middleware");

const router = express.Router();

// Routes
router.post("/register", register);
router.post("/login", login);
router.get("/", authenticate, isAdmin, fetchUsers);
router.delete("/:id", authenticate, isAdmin, deleteUserById);

// ✅ Add this route
router.get("/profile", authenticate, getProfile);

module.exports = router;
