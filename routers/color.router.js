const express = require("express");
const router = express.Router();
const { getColor, createColor, updateColorById, deleteColorById } = require("../controllers/color.controller");
const { authenticate, isAdmin } = require("../auth/auth.middleware");

router.post("/create", authenticate, isAdmin, createColor);
router.get("/", getColor);
router.put("/:id", authenticate, isAdmin, updateColorById);
router.delete("/:id", authenticate, isAdmin, deleteColorById);

module.exports = router;
