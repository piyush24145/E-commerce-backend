const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    products: [
      {
        product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
        quantity: Number,
      },
    ],
    totalAmount: { type: Number, required: true }, // ✅ renamed
    paymentId: { type: String },
    paymentStatus: { type: String, default: "unpaid" },
    orderStatus: { type: String, default: "Pending" },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Order", orderSchema);
