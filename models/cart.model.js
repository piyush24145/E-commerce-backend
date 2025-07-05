const mongoose = require("mongoose");

const cartSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  products: [
    {
      product: { type: mongoose.Schema.Types.ObjectId, ref: "Product" },
      quantity: { type: Number, default: 1 },
    },
  ],
  // totalPrice:{type:Number,required:true},
orderStatus:{type:String,default:"pending"},
paymentStatus:{type:String,default:"pending"},
// paymentId:{type:String,required:true},
createdAt:{type:Date,default:new Date()},
});
module.exports = mongoose.models.Cart || mongoose.model("Cart", cartSchema);
