const mongoose = require('mongoose');

const forumSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  posts: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Post'
  }]
});

module.exports = mongoose.model('Forum', forumSchema);