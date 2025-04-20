const express = require("express");
const { createComment, getComments, getCommentById, updateComment, deleteComment } = require("../controllers/commentController");
const { authenticateToken, authorizeAdmin } = require("../middleware/authMiddleware"); // Sửa cách import

const router = express.Router();

router.post("/", authenticateToken, createComment); // Chỉ user đã đăng nhập mới có thể bình luận
router.get("/", getComments); // Bất kỳ ai cũng có thể xem bình luận
router.get("/:id", getCommentById); // Bất kỳ ai cũng có thể xem chi tiết bình luận
router.put("/:id", authenticateToken, updateComment); // Chỉ tác giả hoặc admin có thể sửa bình luận
router.delete("/:id", authenticateToken, deleteComment); // Chỉ tác giả hoặc admin có thể xóa bình luận

module.exports = router;