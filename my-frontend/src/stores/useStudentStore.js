import { defineStore } from "pinia";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

export const useStudentStore = defineStore("student", {
  state: () => ({
    student: null,
    posts: [],
    forums: [],
    token: localStorage.getItem("token") || "", // Khởi tạo token từ localStorage
  }),
  actions: {
    // Lấy thông tin sinh viên
    async fetchStudentInfo() {
      try {
        if (!this.token) throw new Error("Chưa đăng nhập hoặc token không tồn tại");
        const decodedToken = jwtDecode(this.token);
        const response = await axios.get(`https://my-backend-v7fg.onrender.com/api/students/${decodedToken.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.student = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy thông tin sinh viên: ", error);
        throw error;
      }
    },

    // Lấy các bài viết của sinh viên
    async fetchStudentPosts() {
      try {
        if (!this.token) throw new Error("Chưa đăng nhập hoặc token không tồn tại");
        const decodedToken = jwtDecode(this.token);
        const response = await axios.get(`https://my-backend-v7fg.onrender.com/api/posts/student/${decodedToken.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.posts = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy bài viết: ", error);
        throw error;
      }
    },

    // Lấy các chủ đề của sinh viên
    async fetchStudentForums() {
      try {
        if (!this.token) throw new Error("Chưa đăng nhập hoặc token không tồn tại");
        const decodedToken = jwtDecode(this.token);
        const response = await axios.get(`https://my-backend-v7fg.onrender.com/api/forums/student/${decodedToken.id}`, {
          headers: { Authorization: `Bearer ${this.token}` },
        });
        this.forums = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy chủ đề: ", error);
        throw error;
      }
    },

    // Cập nhật thông tin sinh viên
    async updateStudentInfo(studentData) {
      try {
        if (!this.token) throw new Error("Chưa đăng nhập hoặc token không tồn tại");
        const decodedToken = jwtDecode(this.token);
        console.log("Gửi lên backend: ", studentData);
        const response = await axios.put(
          `https://my-backend-v7fg.onrender.com/api/students/${decodedToken.id}`,
          studentData,
          {
            headers: { Authorization: `Bearer ${this.token}` },
          }
        );
        this.student = response.data;
        return response.data;
      } catch (error) {
        console.error("Cập nhật thông tin thất bại: ", error);
        throw error;
      }
    },

    // Đăng xuất
    logout() {
      this.student = null; // Reset student
      this.posts = []; // Reset posts
      this.forums = []; // Reset forums
      this.token = ""; // Reset token trong store
      localStorage.removeItem("token"); // Xóa token khỏi localStorage
    },

    // Cập nhật token sau khi đăng nhập (nếu cần)
    setToken(token) {
      this.token = token;
      localStorage.setItem("token", token); // Lưu token vào localStorage
    },
  },
});