const Color = require("../models/color.model");

exports.createColor = async (req, res) => {
  try {
    const { name, description } = req.body;
    const newColor = new Color({ name, description });
    await newColor.save();
    res.status(200).json({ success: true, message: "Color created successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in Color creation" });
  }
};

exports.getColor = async (req, res) => {
  try {
    const Colors = await Color.find();
    res.status(200).json({ success: true, Colors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in fetching Colors" });
  }
};

exports.updateColorById = async (req, res) => {
  try {
    const id = req.params.id;
    const { name, description } = req.body;
    console.log(req.body);
    await Color.findOneAndUpdate({ _id: id }, { $set: { name, description } });
    const Colors = await Color.find();
    res.status(200).json({ success: true, Colors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in updating Color" });
  }
};

exports.deleteColorById = async (req, res) => {
  try {
    const id = req.params.id;
    await Color.findOneAndDelete({ _id: id });
    const Colors = await Color.find();
    res.status(200).json({ success: true, message: "Color deleted successfully", Colors });
  } catch (error) {
    res.status(500).json({ success: false, message: "Error in deleting Color" });
  }
};