const express = require("express");
require("dotenv").config();
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");

const app = express();

// Routers
const productRouter = require("./routers/product.router");
const categoryRouter = require("./routers/category.router");
const colorRouter = require("./routers/color.router");
const cartRouter = require("./routers/cart.router");
const orderRouter = require("./routers/order.router");
const userRouter = require("./routers/user.router");
const paymentRouter=require("./routers/payment.router")

// Middleware
app.use(cors({ exposedHeaders: "Authorization" }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static folder for image access
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// DB Connection
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
})
.then(() => console.log("MongoDB connected successfully"))
.catch((err) => console.log("Error in mongodb connection.", err));
// Routes
app.use("/products", productRouter);
app.use("/category", categoryRouter);
app.use("/color", colorRouter);
app.use("/cart", cartRouter);
app.use("/orders", orderRouter);
app.use("/user", userRouter);
app.use("/payment",paymentRouter)
// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});