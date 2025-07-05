const express = require("express");
const router = express.Router();
const {  getCart, addToCart , updateCart, deleteItemFromCart}= require("../controllers/cart.controller");
const { authenticate } = require("../auth/auth.middleware");

// Routes
router.post("/add",authenticate, addToCart);
router.get("/", authenticate,getCart);
router.put("/:id", authenticate,updateCart);
router.delete("/:id", authenticate,deleteItemFromCart);

module.exports = router;
