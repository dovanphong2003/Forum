const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
exports.getStudents = async (req, res) => {
  try {
    const students = await Student.find();
    res.status(200).json(students);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.getStudentById = async (req, res) => {
  try {
    const student = await Student.findById(req.params.id);
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.updateStudent = async (req, res) => {
  try {
    // Kiểm tra nếu có thay đổi mật khẩu thì băm lại mật khẩu
    console.log("kiem tra student")
    if (req.body.password) {
      const salt = await bcrypt.genSalt(10);
      req.body.password = await bcrypt.hash(req.body.password, salt);
    }

    const student = await Student.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!student) return res.status(404).json({ message: "Student not found" });
    res.status(200).json(student);
  } catch (error) {
    console.log("Errror up date student: ",error)
    res.status(500).json({ error: error.message });
  }
};

// Thêm sinh viên mới
exports.createStudent = async (req, res) => {
  try {
    const { username, name, email, password, phoneNumber, dateOfBirth, role } = req.body;

    // Kiểm tra email hoặc username đã tồn tại
    const existingStudent = await Student.findOne({ $or: [{ email }, { username }] });
    if (existingStudent) {
      return res.status(400).json({ message: "Email hoặc username đã tồn tại" });
    }

    // Hash mật khẩu
    // Hash mật khẩu
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo sinh viên mới
    const student = new Student({
      username,
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      dateOfBirth,
      role: role || "student",
    });
console.log("student: ",student);
    await student.save();
    const studentResponse = student.toObject();
    delete studentResponse.password; // Không trả về password
    res.status(201).json({ message: "Thêm sinh viên thành công!", student: studentResponse });
  } catch (error) {
    console.error("Error in createStudent:", error);
    res.status(500).json({ error: error.message });
  }
};
// Xóa sinh viên
exports.deleteStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const student = await Student.findById(id);
    if (!student) {
      return res.status(404).json({ message: "Sinh viên không tồn tại" });
    }

    await Student.deleteOne({ _id: id });
    res.status(200).json({ message: "Xóa sinh viên thành công!" });
  } catch (error) {
    console.error("Error in deleteStudent:", error);
    res.status(500).json({ error: error.message });
  }
};