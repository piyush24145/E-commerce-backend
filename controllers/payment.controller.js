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

      const cart = await Cart.findOne({ user: userId }).populate(
        "products.product"
      );

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
            images:
              item.product.images?.length > 0
                ? [item.product.images[0]]
                : [],
          },
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        mode: "payment",
        line_items: lineItems,

        // 🔥 MOST IMPORTANT
        return_url: `${CLIENT_URL}/payment/return?session_id={CHECKOUT_SESSION_ID}`,
      });

      // ✅ sessionId frontend ko bhejna MUST hai
      res.json({
        clientSecret: session.client_secret,
        sessionId: session.id,
      });
    } catch (error) {
      console.error("❌ Stripe Checkout Error:", error.message);
      res.status(500).json({ error: "Stripe session creation failed" });
    }
  },

  // ================= VERIFY PAYMENT & CREATE ORDER =================
  sessionStatus: async (req, res) => {
    try {
      const { session_id } = req.query;
      if (!session_id) {
        return res.status(400).json({ error: "Missing session_id" });
      }

      const session = await stripe.checkout.sessions.retrieve(session_id);
      const userId = req.user.id;

      // ✅ payment not done
      if (session.payment_status !== "paid") {
        return res.json({
          status: session.payment_status,
          customer_email: session.customer_details?.email || "",
        });
      }

      // 🔒 prevent duplicate orders
      const existingOrder = await Order.findOne({
        paymentId: session.id,
      });

      if (!existingOrder) {
        const cart = await Cart.findOne({ user: userId }).populate(
          "products.product"
        );

        if (cart && cart.products.length > 0) {
          const totalAmount = cart.products.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          const order = new Order({
            user: userId,
            products: cart.products,
            totalAmount,
            paymentId: session.id,
            paymentStatus: "paid",
            orderStatus: "Pending",
          });

          await order.save();

          // clear cart
          cart.products = [];
          await cart.save();
        }
      }

      res.json({
        status: "paid",
        customer_email: session.customer_details?.email || "",
      });
    } catch (error) {
      console.error("❌ Session verification error:", error.message);
      res.status(500).json({ error: "Failed to verify payment" });
    }
  },
};

