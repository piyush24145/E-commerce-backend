require("dotenv").config();
const Stripe = require("stripe");
const stripe = new Stripe(process.env.STRIPE_SECRET);

const Cart = require("../models/cart.model");
const Order = require("../models/order.model");

module.exports = {
  // ================= CREATE CHECKOUT SESSION =================
  createCheckoutSession: async (req, res) => {
    try {
      const userId = req.user.id;
      const CLIENT_URL = process.env.CLIENT_URL;

      const cart = await Cart.findOne({ user: userId }).populate("products.product");

      if (!cart || cart.products.length === 0) {
        return res.status(400).json({ message: "Cart is empty" });
      }

      const lineItems = cart.products.map((item) => ({
        price_data: {
          currency: "inr",
          unit_amount: item.product.price * 100,
          product_data: {
            name: item.product.title,
            description: item.product.short_des || "",
            images: item.product.images?.length
              ? [item.product.images[0]]
              : [],
          },
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "payment",
        payment_method_types: ["card"],
        line_items: lineItems,
        return_url: `${CLIENT_URL}/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      });

      res.json({
        clientSecret: session.client_secret,
        sessionId: session.id,
      });
    } catch (err) {
      console.error("Stripe checkout error:", err.message);
      res.status(500).json({ error: "Checkout failed" });
    }
  },

  // ================= VERIFY PAYMENT & CREATE ORDER =================
  verifyPayment: async (req, res) => {
    try {
      const { session_id } = req.query;
      const userId = req.user.id;

      if (!session_id) {
        return res.status(400).json({ success: false, message: "Missing session_id" });
      }

      const session = await stripe.checkout.sessions.retrieve(session_id);

      if (session.payment_status !== "paid") {
        return res.json({
          success: false,
          status: session.payment_status,
        });
      }

      // 🔒 Prevent duplicate order
      const existingOrder = await Order.findOne({ paymentId: session.id });
      if (existingOrder) {
        return res.json({ success: true, order: existingOrder });
      }

      const cart = await Cart.findOne({ user: userId }).populate("products.product");

      if (!cart || cart.products.length === 0) {
        return res.status(400).json({ success: false, message: "Cart empty" });
      }

      const totalAmount = cart.products.reduce(
        (sum, item) => sum + item.product.price * item.quantity,
        0
      );

      const order = await Order.create({
        user: userId,
        products: cart.products,
        totalAmount,
        paymentId: session.id,
        paymentStatus: "paid",
        orderStatus: "Pending",
      });

      // clear cart
      cart.products = [];
      await cart.save();

      res.json({
        success: true,
        order,
      });
    } catch (err) {
      console.error("Verify payment error:", err.message);
      res.status(500).json({ success: false });
    }
  },
};
