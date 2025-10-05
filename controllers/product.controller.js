// controllers/product.controller.js
const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Color = require("../models/color.model");

// ==================== CREATE PRODUCT ====================
exports.createProduct = async (req, res) => {
  try {
    const { title, description, short_des, price, stock, category, color } = req.body;
    // multer-storage-cloudinary provides file.path (secure URL) for each uploaded file
    const imagePaths = req.files?.map((file) => file.path || file.filename) || [];

    const newProduct = new Product({
      title,
      description,
      short_des,
      price,
      stock,
      category,
      color,
      images: imagePaths,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "✅ Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("Error in createProduct:", err);
    res.status(500).json({
      success: false,
      message: "❌ Server error while creating product",
    });
  }
};

// ==================== GET ALL PRODUCTS ====================
exports.getProducts = async (req, res) => {
  try {
    const { category, color, search } = req.query;
    const filter = {};

    if (category) filter.category = { $in: Array.isArray(category) ? category : [category] };
    if (color) filter.color = { $in: Array.isArray(color) ? color : [color] };

    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const products = await Product.find(filter)
      .populate("category", "name")
      .populate("color", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, products });
  } catch (err) {
    console.error("Error in getProducts:", err);
    res.status(500).json({
      success: false,
      message: "❌ Failed to fetch products",
    });
  }
};

// ==================== GET SINGLE PRODUCT ====================
exports.getSingleProduct = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId)
      .populate("category", "name")
      .populate("color", "name");

    if (!product) return res.status(404).json({ success: false, message: "❌ Product not found" });

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("Error in getSingleProduct:", err);
    res.status(500).json({ success: false, message: "❌ Failed to fetch product" });
  }
};

// ==================== UPDATE PRODUCT ====================
exports.updateProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);
    if (!existingProduct) return res.status(404).json({ success: false, message: "❌ Product not found" });

    const { title, description, short_des, price, stock, category, color } = req.body;

    if (title) existingProduct.title = title;
    if (description) existingProduct.description = description;
    if (short_des) existingProduct.short_des = short_des;
    if (price) existingProduct.price = price;
    if (stock) existingProduct.stock = stock;
    if (category) existingProduct.category = category;
    if (color) existingProduct.color = color;

    // If new images uploaded, replace images with uploaded ones.
    if (req.files && req.files.length > 0) {
      existingProduct.images = req.files.map((file) => file.path || file.filename);
    }

    await existingProduct.save();
    res.status(200).json({ success: true, message: "✅ Product updated successfully", product: existingProduct });
  } catch (err) {
    console.error("Error in updateProductById:", err);
    res.status(500).json({ success: false, message: "❌ Failed to update product" });
  }
};

// ==================== DELETE PRODUCT ====================
exports.deleteProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ success: false, message: "❌ Product not found" });

    await product.deleteOne();
    res.status(200).json({ success: true, message: "✅ Product deleted successfully" });
  } catch (err) {
    console.error("❌ Error in deleteProductById:", err);
    res.status(500).json({ success: false, message: "❌ Failed to delete product" });
  }
};
