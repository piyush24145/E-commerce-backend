const express = require("express");
const router = express.Router();
const {
  createCheckoutSession,
  sessionStatus,
} = require("../controllers/payment.controller");
const { authenticate } = require("../auth/auth.middleware");

router.post("/session-create", authenticate, createCheckoutSession);
router.get("/session-status", authenticate, sessionStatus);

module.exports = router;
