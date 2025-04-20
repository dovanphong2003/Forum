const Post = require("../models/Post");
const Comment = require("../models/Comment");
const Forum = require("../models/Forum");
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("forum", "title");
    if (!post) return res.status(404).json({ message: "Post not found" });

    const comments = await Comment.find({ post: req.params.id })
      .populate("createdBy", "username email")
      .lean();

    // Chuyển image thành Base64 cho tất cả bình luận
    comments.forEach((comment) => {
      if (comment.image && Buffer.isBuffer(comment.image)) {
        comment.imageBase64 = comment.image.toString("base64");
      }
    });

    const response = {
      _id: post._id,
      content: post.content,
      createdAt: post.createdAt,
      createdBy: post.createdBy,
      forum: post.forum,
      comments: comments,
    };

    console.log("Response:", response);
    res.status(200).json(response);
  } catch (error) {
    console.error("Error in getPostById:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.createPost = async (req, res) => {
  try {
    const { content, createdBy, forum } = req.body;
    console.log("forum:::::::::: ",forum)
    // Kiểm tra các trường bắt buộc
    if (!content || !createdBy || !forum) {
      return res.status(400).json({ message: "Content, createdBy, and forum are required" });
    }

    // Kiểm tra Forum có tồn tại không
    const forumExists = await Forum.findById(forum);
    if (!forumExists) {
      return res.status(404).json({ message: "Forum not found" });
    }

    // Tạo bài viết mới
    const post = new Post({ content, createdBy, forum });
    await post.save();

    // Cập nhật mảng posts trong Forum
    await Forum.findByIdAndUpdate(
      forum,
      { $push: { posts: post._id } },
      { new: true }
    );

    // Populate createdBy và forum
    await post.populate("createdBy", "username email");
    await post.populate("forum", "title");

    res.status(201).json({ message: "Post created successfully!", post });
  } catch (error) {
    console.error("Error in createPost:", error);
    res.status(500).json({ error: error.message });
  }
};
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("createdBy", "username email")
      .populate("forum", "title");
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getPosts:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.updatePost = async (req, res) => {
  try {
    const { content, forum } = req.body;
    const post = await Post.findByIdAndUpdate(
      req.params.id,
      { content, forum, updatedAt: Date.now() },
      { new: true }
    );
    if (!post) return res.status(404).json({ message: "Post not found" });
    await post.populate("createdBy", "username email");
    await post.populate("forum", "title");
    res.status(200).json({ message: "Post updated successfully!", post });
  } catch (error) {
    console.error("Error in updatePost:", error);
    res.status(500).json({ error: error.message });
  }
};

exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findByIdAndDelete(req.params.id);
    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json({ message: "Post deleted successfully!" });
  } catch (error) {
    console.error("Error in deletePost:", error);
    res.status(500).json({ error: error.message });
  }
};
  
exports.getPostsByStudent = async (req, res) => {
  try {
    const posts = await Post.find({ createdBy: req.params.studentId })
      .populate("createdBy", "username email")
      .populate("forum", "title");
    res.status(200).json(posts);
  } catch (error) {
    console.error("Error in getPostsByStudent:", error);
    res.status(500).json({ error: error.message });
  }
};