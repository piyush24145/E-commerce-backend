const User = require("../models/user.model");
const Order = require("../models/order.model");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

module.exports = {
  // =================== REGISTER ===================
  register: async (req, res) => {
    try {
      const { name, email, password, role } = req.body;

      if (!name || !email || !password) {
        return res.status(400).json({
          success: false,
          message: "Name, Email, and Password are required",
        });
      }

      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(403).json({
          success: false,
          message: "User already registered",
        });
      }

      const salt = bcrypt.genSaltSync(10);
      const hashPassword = bcrypt.hashSync(password, salt);

      const newUser = new User({
        name,
        email,
        password: hashPassword,
        role: role || "user",
      });

      await newUser.save();

      res.status(201).json({
        success: true,
        message: "User registered successfully",
      });
    } catch (error) {
      console.error("Register Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during registration",
      });
    }
  },

  // =================== LOGIN ===================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          success: false,
          message: "Email and Password are required",
        });
      }

      const existingUser = await User.findOne({ email });
      if (!existingUser) {
        return res.status(404).json({
          success: false,
          message: "User is not registered",
        });
      }

      const isAuth = bcrypt.compareSync(password, existingUser.password);
      if (!isAuth) {
        return res.status(401).json({
          success: false,
          message: "Password is incorrect",
        });
      }

      const token = jwt.sign(
        {
          id: existingUser._id,
          name: existingUser.name,
          role: existingUser.role,
        },
        process.env.JWT_SECRET,
        { expiresIn: "1d" }
      );

      res.status(200).json({
        success: true,
        message: "Login successful",
        userData: {
          id: existingUser._id,
          name: existingUser.name,
          email: existingUser.email,
          role: existingUser.role,
          token,
        },
      });
    } catch (error) {
      console.error("Login Error:", error);
      res.status(500).json({
        success: false,
        message: "Internal server error during login",
      });
    }
  },

  // =================== GET PROFILE ===================
  // ✅ GET PROFILE
getProfile: async (req, res) => {
    try {
      const userId = req.user.id;

      const user = await User.findById(userId).select("-password");
      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      const orders = await Order.find({ user: userId }).sort({ createdAt: -1 });

      res.status(200).json({ success: true, user, orders });
    } catch (error) {
      console.error("❌ Error in getProfile:", error);
      res.status(500).json({ success: false, message: "Internal server error" });
    }
  },

  // =================== FETCH ALL USERS ===================
  fetchUsers: async (req, res) => {
    try {
      const users = await User.find().select("-password");
      res.status(200).json({ success: true, users });
    } catch (error) {
      res.status(500).json({ success: false, message: "Error in fetching users" });
    }
  },

  // =================== DELETE USER BY ID ===================
  deleteUserById: async (req, res) => {
    try {
      const user = await User.findOne({ _id: req.params.id });

      if (!user) {
        return res.status(404).json({ success: false, message: "User not found" });
      }

      if (user.role === "admin") {
        return res.status(405).json({ success: false, message: "Admin can't be deleted." });
      }

      await User.findOneAndDelete({ _id: req.params.id });

      const users = await User.find().select("-password");
      res.status(200).json({
        success: true,
        message: "User deleted successfully",
        users,
      });
    } catch (error) {
      console.error("Delete Error:", error);
      res.status(500).json({
        success: false,
        message: "Error in deleting user data",
      });
    }
  },
};
