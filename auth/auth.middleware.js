const jwt = require("jsonwebtoken");

module.exports = {
  authenticate: async (req, res, next) => {
    try {
      const authHeader = req.header("Authorization");
      console.log("Header", authHeader); // ✅ Debugging header

      if (!authHeader || !authHeader.startsWith("Bearer ")) {
        return res.status(401).json({
          success: false,
          message: "Authorization header is missing or malformed",
        });
      }

      const token = authHeader.split(" ")[1];
      if (!token) {
        return res.status(401).json({
          success: false,
          message: "Token is missing",
        });
      }

      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      req.user = decoded; // ✅ Add user to request
      console.log("✅ JWT Decoded:", decoded); // ✅ Confirm role etc.
      next();
    } catch (error) {
      console.error("❌ JWT Auth Error:", error.message);
      return res.status(403).json({
        success: false,
        message: "Authentication failed",
      });
    }
  },

  isAdmin: async (req, res, next) => {
    try {
      if (req.user?.role === "admin") {
        return next();
      } else {
        return res.status(403).json({
          success: false,
          message: "Access denied. Admins only.",
        });
      }
    } catch (error) {
      console.error("❌ isAdmin Error:", error.message);
      return res.status(403).json({
        success: false,
        message: "Error while checking admin access",
      });
    }
  }
};
