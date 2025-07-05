const Order = require("../models/order.model");

module.exports = {
  // 📦 User: Get orders for logged-in user
  getOrderByUser: async (req, res) => {
    try {
      const userId = req.user.id;

      const orders = await Order.find({ user: userId })
        .populate("products.product")
        .sort({ createdAt: -1 });

      res.json({ success: true, orders });
    } catch (err) {
      console.error("❌ Error fetching user orders:", err);
      res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
  },


 getOrderById: async (req, res) => {
  try {
    const orderId = req.params.id;

    const order = await Order.findById(orderId)
      .populate("products.product")
      .populate("user", "name email");

    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    res.json({ success: true, order });
  } catch (err) {
    console.error("❌ Error fetching order by ID:", err.message);
    res.status(500).json({ success: false, message: "Failed to fetch order" });
  }
},



  // 🛡️ Admin: Get all orders
  getAllOrders: async (req, res) => {
    try {
      const orders = await Order.find()
        .populate("products.product user", "name email")
        .sort({ createdAt: -1 });

      res.json({ success: true, orders });
    } catch (err) {
      console.error("❌ Error fetching all orders:", err);
      res.status(500).json({ success: false, message: "Failed to fetch orders" });
    }
  },

  // 🔄 Admin: Update order status (Pending → Confirmed → Delivered)
  updateOrderStatus: async (req, res) => {
    try {
      const orderId = req.params.id;
      const { status } = req.body;

      if (!["Pending", "Confirmed", "Delivered"].includes(status)) {
        return res.status(400).json({ success: false, message: "Invalid status value" });
      }

      const updatedOrder = await Order.findByIdAndUpdate(
        orderId,
        { orderStatus: status },
        { new: true }
      );

      if (!updatedOrder) {
        return res.status(404).json({ success: false, message: "Order not found" });
      }

      res.json({ success: true, order: updatedOrder });
    } catch (err) {
      console.error("❌ Error updating order status:", err);
      res.status(500).json({ success: false, message: "Failed to update status" });
    }
  },
};
