const express = require("express");
const { register, login, protectedRoute } = require("../controllers/authController");
const { authenticateToken } = require("../middleware/authMiddleware"); // Sửa cách import

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.get("/protected", authenticateToken, protectedRoute); // Sử dụng authenticateToken

module.exports = router;