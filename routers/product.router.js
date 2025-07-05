const express = require("express");
const {
  getProducts,
  createProduct,
  getSingleProduct,
  updateProductById,
  deleteProductById,
} = require("../controllers/product.controller");

const { authenticate, isAdmin } = require("../auth/auth.middleware");
const { upload } = require("../middleware/multer");

const router = express.Router();

// ==================== Public Routes ====================
router.get("/", getProducts);               // GET /products
router.get("/:id", getSingleProduct);       // GET /products/:id

// ==================== Admin Routes ====================
router.post(
  "/create",                                // POST /products/create
  authenticate,                             // ✅ Check login
  isAdmin,                                  // ✅ Check admin role
  upload.array("images", 5),                // ✅ Upload up to 5 images
  createProduct
);

router.put(
  "/:id",                                   // PUT /products/:id
  authenticate,
  isAdmin,
  upload.array("images", 5),
  updateProductById
);

router.delete(
  "/:id",                                   // DELETE /products/:id
  authenticate,
  isAdmin,
  deleteProductById
);

module.exports = router;
