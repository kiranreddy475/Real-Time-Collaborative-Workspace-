
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  // Check whether the token was provided
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      message: "Access denied. Token is required."
    });
  }

  // Extract the token from "Bearer <token>"
  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Make the authenticated user's information available to the next handler
    req.user = decoded;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Invalid or expired token."
    });
  }
}

module.exports = authenticateToken;
