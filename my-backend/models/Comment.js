const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  content: { type: String }, // Không bắt buộc nếu có hình ảnh
  image: { type: Buffer }, // Lưu dữ liệu nhị phân của hình ảnh
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "Student" },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  parent: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
});

module.exports = mongoose.model("Comment", commentSchema);