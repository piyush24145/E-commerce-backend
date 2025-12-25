const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  verifyPayment,
} = require("../controllers/payment.controller");

const { authenticate } = require("../auth/auth.middleware");

// checkout → auth required
router.post("/session-create", authenticate, createCheckoutSession);

// verify → NO auth (Stripe redirect)
router.get("/verify", verifyPayment);

module.exports = router;


