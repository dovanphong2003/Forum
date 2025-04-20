const Forum = require("../models/Forum");

exports.createForum = async (req, res) => {
  try {
    const { title, description, createdBy } = req.body;

    const forum = new Forum({ title, description, createdBy });
    await forum.save();

    res.status(201).json({ message: "Forum created successfully!", forum });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getForums = async (req, res) => {
  try {
    const forums = await Forum.find()
      .populate("createdBy", "username email") // Lấy thông tin người tạo
      .populate("posts"); // Lấy danh sách bài viết

    res.status(200).json(forums);
  } catch (error) {
    console.log("errrrrror: ",error)
    res.status(500).json({ error: error.message });
  }
};

exports.getForumById = async (req, res) => {

  try {
    const forum = await Forum.findById(req.params.id)
      .populate("createdBy", "username email")
      .populate("posts");

    if (!forum) return res.status(404).json({ message: "Forum not found" });

    res.status(200).json(forum);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// controller cho chủ đề của sinh viên
exports.getForumsByStudent = async (req, res) => {
  console.log("req: ",req.params.studentId)
  try {
    const forums = await Forum.find({ createdBy: req.params.studentId })
      .populate("posts");
      console.log("forums: ",forums);
    if (!forums) return res.status(404).json({ message: "No forums found" });
    res.status(200).json(forums);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateForum = async (req, res) => {
  try {
    const forum = await Forum.findByIdAndUpdate(req.params.id, req.body, { new: true });

    if (!forum) return res.status(404).json({ message: "Forum not found" });

    res.status(200).json(forum);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteForum = async (req, res) => {
  try {
    const forum = await Forum.findByIdAndDelete(req.params.id);

    if (!forum) return res.status(404).json({ message: "Forum not found" });

    res.status(200).json({ message: "Forum deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
