const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();
const allowedOrigins = [ 'https://e-commerce-fronted-epjfa7uxl-piyush24145s-projects.vercel.app',
  'http://localhost:3000'];

app.use(cors({
  origin: function (origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  exposedHeaders: "Authorization"
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ✅ Serve uploaded images
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ✅ Connect MongoDB Atlas
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true
})
.then(() => console.log("✅ MongoDB connected successfully"))
.catch((err) => console.log("❌ Error in MongoDB connection:", err));

// ✅ Import and use Routers
const productRouter = require("./routers/product.router");
const categoryRouter = require("./routers/category.router");
const colorRouter = require("./routers/color.router");
const cartRouter = require("./routers/cart.router");
const orderRouter = require("./routers/order.router");
const userRouter = require("./routers/user.router");
const paymentRouter = require("./routers/payment.router");

app.use("/products", productRouter);
app.use("/category", categoryRouter);
app.use("/color", colorRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/user", userRouter);
app.use("/payment", paymentRouter);

// ✅ Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server is running on port ${PORT}`);
});


