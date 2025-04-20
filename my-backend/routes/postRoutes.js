const express = require("express");
const { 
  createPost, 
  getPosts, 
  getPostById, 
  updatePost, 
  deletePost,
  getPostsByStudent
} = require("../controllers/postController");
const { authenticateToken, authorizeAdmin } = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/", authenticateToken, createPost);
router.get("/", getPosts);
router.get("/:id", getPostById);
router.get("/student/:studentId", authenticateToken, getPostsByStudent);
router.put("/:id", authenticateToken, authorizeAdmin, updatePost);
router.delete("/:id", authenticateToken, authorizeAdmin, deletePost);

module.exports = router;