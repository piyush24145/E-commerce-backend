// routers/product.router.js
const express = require("express");
const {
  getProducts,
  createProduct,
  getSingleProduct,
  updateProductById,
  deleteProductById,
} = require("../controllers/product.controller");

const { authenticate, isAdmin } = require("../auth/auth.middleware");
const upload = require("../middleware/multer"); // direct import

const router = express.Router();

// ==================== Public Routes ====================
router.get("/", getProducts);
router.get("/:id", getSingleProduct);

// ==================== Admin Routes ====================
router.post("/create", authenticate, isAdmin, upload.array("images", 5), createProduct);
router.put("/:id", authenticate, isAdmin, upload.array("images", 5), updateProductById);
router.delete("/:id", authenticate, isAdmin, deleteProductById);

module.exports = router;
