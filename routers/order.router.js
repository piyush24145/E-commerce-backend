const express = require("express");
const router = express.Router();

const {
  getOrderByUser,
  getAllOrders,
  updateOrderStatus,
  getOrderById,
} = require("../controllers/order.controller");

const { authenticate, isAdmin } = require("../auth/auth.middleware");

// 🧾 Routes

router.get("/user", authenticate, getOrderByUser);
router.get("/admin", authenticate, isAdmin, getAllOrders); // ✅ move this UP
router.get("/:id", authenticate, getOrderById);

// 🛡️ Admin: Update order status
router.put("/:id/status", authenticate, isAdmin, updateOrderStatus);

module.exports = router;
