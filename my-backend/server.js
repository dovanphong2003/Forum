require("dotenv").config();
const express = require("express");
const cors = require("cors"); // ✅ Import cors
const connectDB = require("./config/db");

const app = express();

// ✅ Thêm CORS để cho phép frontend truy cập API
app.use(cors({
  origin: [
    "http://localhost:4000",
    "http://localhost:5000",
    "https://splendid-muffin-516e03.netlify.app"
  ],
  credentials: true
}));


app.use(express.json());

// Kết nối MongoDB
connectDB();

// Import routes
const studentRoutes = require("./routes/studentRoutes");
const forumRoutes = require("./routes/forumRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const authRoutes = require("./routes/authRoutes");

// Sử dụng routes
app.use("/api/students", studentRoutes);
app.use("/api/forums", forumRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/auth", authRoutes);

const PORT = 5000;
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
