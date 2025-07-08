require("dotenv").config();
const stripe = require("stripe")(process.env.STRIPE_SECRET);
const Cart = require("../models/cart.model");
const Order = require("../models/order.model");

module.exports = {
  createCheckoutSession: async (req, res) => {
    try {
      const userId = req.user.id;

    
      const YOUR_DOMAIN = process.env.CLIENT_URL;

      const cart = await Cart.findOne({ user: userId }).populate("products.product");
      if (!cart || cart.products.length === 0) {
        return res.status(404).json({ success: false, message: "Cart is empty" });
      }

      const lineItems = cart.products.map((item) => ({
        price_data: {
          currency: "inr",
          unit_amount: item.product.price * 100,
          product_data: {
            name: item.product.title,
            description: item.product.short_des || "",
            images:
              item.product.images && item.product.images.length > 0
                ? [`${YOUR_DOMAIN}/${item.product.images[0]}`]
                : [],
          },
        },
        quantity: item.quantity,
      }));

      const session = await stripe.checkout.sessions.create({
        ui_mode: "embedded",
        line_items: lineItems,
        mode: "payment",
        return_url: `${YOUR_DOMAIN}/payment-return?session_id={CHECKOUT_SESSION_ID}`,
      });

      res.json({ clientSecret: session.client_secret });
    } catch (err) {
      console.error("❌ Stripe session error:", err.message);
      res.status(500).json({ error: "Failed to create session" });
    }
  },

  sessionStatus: async (req, res) => {
    try {
      const sessionId = req.query.session_id;
      if (!sessionId) {
        return res.status(400).json({ error: "Missing session_id" });
      }

      const session = await stripe.checkout.sessions.retrieve(sessionId);
      console.log("✅ Stripe session fetched:", session.id);

      const userId = req.user?.id;
      const paymentId = session.id;

      if (session.payment_status === "paid") {
        const cart = await Cart.findOne({ user: userId }).populate("products.product");

        if (cart && cart.products.length > 0) {
          const totalAmount = cart.products.reduce(
            (sum, item) => sum + item.product.price * item.quantity,
            0
          );

          const order = new Order({
            user: userId,
            products: cart.products,
            totalAmount,
            paymentId,
            paymentStatus: "paid",
            orderStatus: "Pending",
          });

          await order.save();

          // ✅ Clear cart after successful payment
          await Cart.findOneAndUpdate({ user: userId }, { $set: { products: [] } });
        }
      }

      res.json({
        status: session.payment_status,
        customer_email: session.customer_details?.email || "",
      });
    } catch (err) {
      console.error("❌ Session fetch error:", err.message);
      res.status(500).json({ error: "Failed to fetch session status" });
    }
  },
};
