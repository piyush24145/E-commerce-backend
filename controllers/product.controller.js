const Product = require("../models/product.model");
const Category = require("../models/category.model");
const Color = require("../models/color.model");

// ==================== CREATE PRODUCT ====================
exports.createProduct = async (req, res) => {
  try {
    const { title, description, short_des, price, stock, category, color } = req.body;

    if (!title || !description || price === undefined || stock === undefined) {
      return res.status(400).json({
        success: false,
        message: "❌ Missing required fields",
      });
    }

    // ✅ Multer images
    let imagePaths = [];
    if (req.files && req.files.length > 0) {
      imagePaths = req.files.map(file => file.path || file.filename);
    }

    // ✅ Validate category
    let categoryObj = null;
    if (category) {
      categoryObj = await Category.findById(category);
      if (!categoryObj) {
        return res.status(400).json({ success: false, message: "❌ Invalid category ID" });
      }
    }

    // ✅ Validate color
    let colorObj = null;
    if (color) {
      colorObj = await Color.findById(color);
      if (!colorObj) {
        return res.status(400).json({ success: false, message: "❌ Invalid color ID" });
      }
    }

    const product = new Product({
      title,
      description,
      short_des,
      price,
      stock,
      category: categoryObj?._id || null,
      color: colorObj?._id || null,
      images: imagePaths,
    });

    await product.save();

    res.status(201).json({
      success: true,
      message: "✅ Product created successfully",
      product,
    });
  } catch (err) {
    console.error("❌ createProduct error:", err);
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

    if (category) filter.category = { $in: [].concat(category) };
    if (color) filter.color = { $in: [].concat(color) };

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
    console.error("❌ getProducts error:", err);
    res.status(500).json({ success: false, message: "❌ Failed to fetch products" });
  }
};

// ==================== GET SINGLE PRODUCT ====================
exports.getSingleProduct = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id)
      .populate("category", "name")
      .populate("color", "name");

    if (!product) {
      return res.status(404).json({ success: false, message: "❌ Product not found" });
    }

    res.status(200).json({ success: true, product });
  } catch (err) {
    console.error("❌ getSingleProduct error:", err);
    res.status(500).json({ success: false, message: "❌ Failed to fetch product" });
  }
};

// ==================== UPDATE PRODUCT ====================
exports.updateProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "❌ Product not found" });
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

    if (title !== undefined) product.title = title;
    if (description !== undefined) product.description = description;
    if (short_des !== undefined) product.short_des = short_des;
    if (price !== undefined) product.price = price;
    if (stock !== undefined) product.stock = stock;
    if (category !== undefined) product.category = category;
    if (color !== undefined) product.color = color;

    let finalImages = [];

    // ✅ SAFE existing images parse
    if (existingImages) {
      try {
        finalImages = Array.isArray(existingImages)
          ? existingImages
          : JSON.parse(existingImages);
      } catch (e) {
        finalImages = [];
      }
    }

    // ✅ Add newly uploaded images
    if (req.files && req.files.length > 0) {
      const newImages = req.files.map(file => file.path || file.filename);
      finalImages = [...finalImages, ...newImages];
    }

    product.images = finalImages;

    await product.save();

    res.status(200).json({
      success: true,
      message: "✅ Product updated successfully",
      product,
    });
  } catch (err) {
    console.error("❌ updateProduct error:", err);
    res.status(500).json({ success: false, message: "❌ Failed to update product" });
  }
};

// ==================== DELETE PRODUCT ====================
exports.deleteProductById = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) {
      return res.status(404).json({ success: false, message: "❌ Product not found" });
    }

    await product.deleteOne();

    res.status(200).json({
      success: true,
      message: "✅ Product deleted successfully",
    });
  } catch (err) {
    console.error("❌ deleteProduct error:", err);
    res.status(500).json({ success: false, message: "❌ Failed to delete product" });
  }
};

