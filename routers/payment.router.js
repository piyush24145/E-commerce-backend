const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  verifyPayment,
} = require("../controllers/payment.controller");

const { authenticate } = require("../auth/auth.middleware");

// 🔐 checkout needs auth
router.post("/session-create", authenticate, createCheckoutSession);

// ❌ NO AUTH HERE (VERY IMPORTANT)
router.get("/verify", verifyPayment);

module.exports = router;
