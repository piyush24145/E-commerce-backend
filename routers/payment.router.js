const express = require("express");
const router = express.Router();

const {
  createCheckoutSession,
  verifyPayment,
} = require("../controllers/payment.controller");

const { authenticate } = require("../auth/auth.middleware");

router.post("/session-create", authenticate, createCheckoutSession);
router.get("/verify", authenticate, verifyPayment);

module.exports = router;
