const jwt = require("jsonwebtoken");
const Student = require("../models/Student");

const authenticateToken = async (req, res, next) => {
  // Lấy token từ header Authorization
  const token = req.header("Authorization")?.replace("Bearer ", "");  // Loại bỏ "Bearer " nếu có

  if (!token) return res.status(401).json({ message: "Access Denied" });

  try {
    // Giải mã token và tìm người dùng trong cơ sở dữ liệu
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "secretkey");
    const user = await Student.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User Not Found" });

    req.user = user;  // Lưu thông tin người dùng vào req.user
    next();  // Tiếp tục với route tiếp theo
  } catch (error) {
    console.log("error: ", error);
    res.status(403).json({ message: "Invalid or Expired Token" });
  }
};

const authorizeAdmin = (req, res, next) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({ message: "Forbidden: Admins Only" });
  }
  next();
};

module.exports = { authenticateToken, authorizeAdmin };
