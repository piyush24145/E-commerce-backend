const Cart = require("../models/cart.model");

module.exports = {
 addToCart: async (req, res) => {
  try {
    const productId = req.body.productId; // ✅ Fix here
    const userId = req.user.id;

    let userCart = await Cart.findOne({ user: userId });

    if (userCart) {
      const productIndex = userCart.products.findIndex(
        (x) => x.product.toString() === productId
      );

      if (productIndex >= 0) {
        userCart.products[productIndex].quantity += 1;
      } else {
        userCart.products.push({ product: productId, quantity: 1 });
      }
    } else {
      userCart = Cart({
        user: userId,
        products: [{ product: productId, quantity: 1 }],
      });
    }

    const savedCart = await userCart.save();
    res.status(200).json({ success: true, data: savedCart });
  } catch (error) {
    console.error("❌ Error in add to cart:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
},

  getCart: async (req, res) => {
  try {
    const userId = req.user.id;
    const userCart = await Cart.findOne({ user: userId }).populate("products.product");

    const totalItems = userCart?.products?.reduce((acc, item) => acc + item.quantity, 0) || 0;  // this is for find quantity numbers

    res.status(200).json({ success: true, cart: userCart, totalItems });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in fetching cart" });
  }
},


  updateCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.id;
      const quantity = req.body.quantity;

      const userCart = await Cart.findOne({ user: userId });
      if (!userCart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }

      const productIndex = userCart.products.findIndex(
        (x) => x.product.toString() === productId
      );

      if (productIndex >= 0) {
        userCart.products[productIndex].quantity = quantity;
      } else {
        return res.status(404).json({ success: false, message: "Product not in cart" });
      }

      await userCart.save();
      res.status(200).json({ success: true, message: "Cart updated successfully" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error in updating cart" });
    }
  },

  deleteItemFromCart: async (req, res) => {
    try {
      const userId = req.user.id;
      const productId = req.params.id;

      const userCart = await Cart.findOne({ user: userId });
      if (!userCart) {
        return res.status(404).json({ success: false, message: "Cart not found" });
      }

      userCart.products = userCart.products.filter(
        (item) => item.product.toString() !== productId
      );

      await userCart.save();
      res.status(200).json({ success: true, message: "Item removed from cart" });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error in deleting item from cart" });
    }
  },
};
