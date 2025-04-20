const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({

  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'Student' },
  forum: { type: mongoose.Schema.Types.ObjectId, ref: 'Forum' },
  comments: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Comment'
  }]
});

module.exports = mongoose.model('Post', postSchema);