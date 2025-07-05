const Category = require("../models/category.model");

exports.createCategory = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newCategory = new Category({ name, description });
    await newCategory.save();
    res.status(200).json({ success: true, message: "Category created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in category creation" });
  }
};

exports.getCategory = async (req, res) => {
  try {
    const categories = await Category.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in fetching categories" });
  }
};

exports.updateCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    await Category.findOneAndUpdate({ _id: id }, { $set: { name, description } });
    const categories = await Category.find();
    res.status(200).json({ success: true, categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in updating category" });
  }
};

exports.deleteCategoryById = async (req, res) => {
  try {
    const id = req.params.id;
    await Category.findOneAndDelete({ _id: id });
    const categories = await Category.find();
    res.status(200).json({ success: true, message: "Category deleted successfully", categories });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in deleting category" });
  }
};