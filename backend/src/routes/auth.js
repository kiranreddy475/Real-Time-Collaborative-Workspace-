
const express = require("express");

const router = express.Router();

// Registration endpoint
router.post("/register", (req, res) => {
  res.status(501).json({
    message: "Registration will be implemented next."
  });
});

// Login endpoint
router.post("/login", (req, res) => {
  res.status(501).json({
    message: "Login will be implemented next."
  });
});

module.exports = router;
