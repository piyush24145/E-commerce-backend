const express = require("express");
const router = express.Router();
const {  getCategory, createCategory , updateCategoryById, deleteCategoryById}= require("../controllers/category.controller");
const { authenticate, isAdmin } = require("../auth/auth.middleware");


// Routes
router.post("/create",authenticate,isAdmin, createCategory);
router.get("/", getCategory);
router.put("/:id", authenticate,isAdmin,  updateCategoryById);
router.delete("/:id",authenticate,isAdmin, deleteCategoryById);

module.exports = router;
