const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Color = require("../models/color.model");

// ==================== CREATE PRODUCT ====================
exports.createProduct = async (req, res) => {
  try {
    const { title, description, short_des, price, stock, category, color } = req.body;

    // Validation check
    if (!title || !description || !price || !stock) {
      return res.status(400).json({
        success: false,
        message: "❌ Missing required fields: title, description, price, or stock",
      });
    }

    // Multer files check
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map((file) => file.path || file.filename);
    } else {
      console.warn("⚠️ No images uploaded for this product");
    }

    // Check if category exists
    let categoryObj = null;
    if (category) {
      categoryObj = await Category.findById(category);
      if (!categoryObj) return res.status(400).json({ success: false, message: "❌ Invalid category ID" });
    }

    // Check if color exists
    let colorObj = null;
    if (color) {
      colorObj = await Color.findById(color);
      if (!colorObj) return res.status(400).json({ success: false, message: "❌ Invalid color ID" });
    }

    const newProduct = new Product({
      title,
      description,
      short_des,
      price,
      stock,
      category: categoryObj?._id || null,
      color: colorObj?._id || null,
      images: imagePaths,
    });

    await newProduct.save();

    res.status(201).json({
      success: true,
      message: "✅ Product created successfully",
      product: newProduct,
    });
  } catch (err) {
    console.error("❌ Error in createProduct:", err);
    res.status(500).json({
      success: false,
      message: "❌ Server error while creating product",
      error: err.message,
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
    console.error("❌ Error in getProducts:", err);
    res.status(500).json({
      success: false,
      message: "❌ Failed to fetch products",
      error: err.message,
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
    console.error("❌ Error in getSingleProduct:", err);
    res.status(500).json({ success: false, message: "❌ Failed to fetch product", error: err.message });
  }
};

// ==================== UPDATE PRODUCT ====================
exports.updateProductById = async (req, res) => {
  try {
    const productId = req.params.id;
    const existingProduct = await Product.findById(productId);

    if (!existingProduct) {
      return res.status(404).json({
        success: false,
        message: "❌ Product not found",
      });
    }

    const {
      title,
      description,
      short_des,
      price,
      stock,
      category,
      color,
      existingImages,
    } = req.body;

    if (title) existingProduct.title = title;
    if (description) existingProduct.description = description;
    if (short_des) existingProduct.short_des = short_des;
    if (price) existingProduct.price = price;
    if (stock) existingProduct.stock = stock;
    if (category) existingProduct.category = category;
    if (color) existingProduct.color = color;

    // 🔥 IMAGE FIX
    let finalImages = [];

    if (existingImages) {
      finalImages = JSON.parse(existingImages);
    } else {
      finalImages = existingProduct.images;
    }

    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path);
      finalImages = [...finalImages, ...newImages];
    }

    existingProduct.images = finalImages;

    await existingProduct.save();

    res.status(200).json({
      success: true,
      message: "✅ Product updated successfully",
      product: existingProduct,
    });
  } catch (err) {
    console.error("❌ Error in updateProductById:", err);
    res.status(500).json({
      success: false,
      message: "❌ Failed to update product",
      error: err.message,
    });
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
    res.status(500).json({ success: false, message: "❌ Failed to delete product", error: err.message });
  }
};
