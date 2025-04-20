const Comment = require("../models/Comment");
const Post = require("../models/Post");
const multer = require("multer");
const path = require("path");

// Cấu hình multer để lưu file vào bộ nhớ (memory)
const upload = multer({
  storage: multer.memoryStorage(),
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png/;
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = filetypes.test(file.mimetype);
    if (extname && mimetype) {
      return cb(null, true);
    } else {
      cb(new Error("Chỉ chấp nhận file JPEG/JPG/PNG!"));
    }
  },
  limits: { fileSize: 500 * 1024 }, // Giới hạn 500KB
}).single("image");

exports.createComment = async (req, res) => {
  try {
    // Xử lý file upload
    upload(req, res, async (err) => {
      if (err) {
        return res.status(400).json({ error: err.message });
      }

      const { content, createdBy, post, parent } = req.body;
      if (!content && !req.file) {
        return res.status(400).json({ error: "Phải có nội dung hoặc hình ảnh!" });
      }

      const commentData = {
        content: content || "",
        createdBy,
        post,
        parent: parent || null,
      };

      // Nếu có file hình ảnh, lưu Buffer
      if (req.file) {
        commentData.image = req.file.buffer;
      }

      const comment = new Comment(commentData);
      await comment.save();
      await comment.populate("createdBy", "username email");

      // Chuyển image thành Base64 để trả về frontend
      const commentResponse = comment.toObject();
      if (commentResponse.image) {
        commentResponse.imageBase64 = commentResponse.image.toString("base64");
        delete commentResponse.image; // Xóa trường image để giảm payload
      }

      res.status(201).json({ message: "Comment created successfully!", comment: commentResponse });
    });
  } catch (error) {
    console.error("Error in createComment:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.getComments = async (req, res) => {
  try {
    const comments = await Comment.find()
      .populate("createdBy", "username email") // Lấy thông tin user
      .populate("post", "content"); // Lấy thông tin bài viết

    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getCommentById = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("post", "content");

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    res.status(200).json(comment);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findByIdAndDelete(req.params.id);

    if (!comment) return res.status(404).json({ message: "Comment not found" });

    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
