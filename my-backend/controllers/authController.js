const Student = require("../models/Student");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

exports.register = async (req, res) => {
  try {
    const { username, name, email, password, phoneNumber, dateOfBirth } = req.body;

    // Kiểm tra email đã tồn tại chưa
    const existingStudent = await Student.findOne({ email });
    if (existingStudent) return res.status(400).json({ message: "Email already exists" });

    // Hash mật khẩu
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Tạo student mới với các trường bổ sung
    const student = new Student({
      username,
      name,
      email,
      password: hashedPassword,
      phoneNumber,
      dateOfBirth,
      role: "student", // Mặc định role là student
    });

    // Lưu sinh viên mới vào cơ sở dữ liệu
    await student.save();

    // Tạo và trả về token sau khi đăng ký thành công
    const token = jwt.sign({ id: student._id }, process.env.JWT_SECRET || "secretkey", { expiresIn: '1h' });

    res.status(201).json({ message: "Student registered successfully!", token });
  } catch (error) {
    console.error(error);  // Ghi log lỗi để dễ debug
    res.status(500).json({ error: error.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("req.body::::: ",req.body);

    // Tìm sinh viên trong cơ sở dữ liệu
    const student = await Student.findOne({ email });
    console.log("tim sv: ",student);
    if (!student) return res.status(400).json({ message: "Invalid credentials" });

    // Kiểm tra mật khẩu
    const isMatch = await bcrypt.compare(password, student.password);
    console.log("kiem tra mat khau: ",isMatch)
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

    // Tạo token JWT
    const token = jwt.sign(
      { id: student._id, email: student.email, role: student.role },
      process.env.JWT_SECRET || "secretkey",
      { expiresIn: "1h" }
    );

    // Trả về token, role và thông tin người dùng (user)
    res.status(200).json({
      token,
      role: student.role,
      user: {
        id: student._id,
        username: student.username,
        email: student.email,
        phoneNumber: student.phoneNumber,
        dateOfBirth: student.dateOfBirth
      }
    });
  } catch (error) {
    console.error(error);  // Ghi log lỗi để dễ debug
    res.status(500).json({ error: error.message });
  }
};

// Endpoint cần xác thực JWT
exports.protectedRoute = (req, res) => {
  res.json({ message: "This is a protected route!", user: req.user });
};
