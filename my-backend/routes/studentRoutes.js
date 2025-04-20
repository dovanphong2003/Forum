const express = require("express");
const { 
  getStudents, 
  getStudentById, 
  createStudent,
  updateStudent, 
  deleteStudent 
} = require("../controllers/studentController");
const { authenticateToken, authorizeAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/", authenticateToken, authorizeAdmin, getStudents);
router.post("/", authenticateToken, authorizeAdmin, createStudent);
router.get("/:id", authenticateToken, async (req, res, next) => {
  // Nếu là admin hoặc chính sinh viên đang xem thông tin của họ thì cho phép
  if (req.user.role === "admin" || req.user._id.toString() === req.params.id) {
    return getStudentById(req, res, next);
  }
  return res.status(403).json({ message: "Forbidden" });
});

router.put("/:id", authenticateToken, async (req, res, next) => {
  console.log("vao den router authencation student");
  // Nếu là admin hoặc chính sinh viên đang cập nhật thông tin của họ thì cho phép
  if (req.user.role === "admin" || req.user._id.toString() === req.params.id) {
    return updateStudent(req, res, next);
  }
  console.log("da xay ra loi");
  return res.status(403).json({ message: "Forbidden" });
});

router.delete("/:id", authenticateToken, authorizeAdmin, deleteStudent); // Chỉ admin được xóa sinh viên

module.exports = router;
