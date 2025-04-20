const express = require("express");
const { 
  createForum, 
  getForums, 
  getForumById, 
  updateForum, 
  deleteForum,
  getForumsByStudent  // Import action mới
} = require("../controllers/forumController");
const { authenticateToken } = require("../middleware/authMiddleware"); // Import middleware đúng

const router = express.Router();

router.post("/", authenticateToken, createForum);
router.get("/", getForums);
router.get("/:id", getForumById);
router.get("/student/:studentId", authenticateToken, getForumsByStudent);  // Thêm route để lấy chủ đề của sinh viên
router.put("/:id", authenticateToken, updateForum);
router.delete("/:id", authenticateToken, deleteForum);

module.exports = router;
