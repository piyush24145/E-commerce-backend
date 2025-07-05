const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  short_des: { type: String },
  price: { type: Number, required: true },
  stock: { type: Number, required: true },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Category",
    required: true,
  },
  color: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Color",
    required: true,
  },
  images: [String], // ✅ IMPORTANT: Add this line
  createdAt: { type: Date, default: new Date() },
});

module.exports = mongoose.model("Product", productSchema);
