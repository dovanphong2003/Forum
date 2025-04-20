import { defineStore } from "pinia";
import axios from "axios";
import { jwtDecode } from 'jwt-decode'

export const useForumStore = defineStore("forum", {
  state: () => ({
    forums: [],
    currentForum: null,
    posts: [],
    currentPost: null,
  }),
  actions: {
    async fetchForums() {
      try {
        const response = await axios.get("https://my-backend-v7fg.onrender.com/api/forums");
        this.forums = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy danh sách diễn đàn:", error);
      }
    },

    async fetchForumById(id) {
      try {
        const response = await axios.get(`https://my-backend-v7fg.onrender.com/api/forums/${id}`);
        this.currentForum = response.data;
        this.posts = response.data.posts;
        console.log("response of forum by id: ",response)
      } catch (error) {
        console.error("Lỗi khi lấy thông tin diễn đàn:", error);
      }
    },

    async createForum(title, description) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }
      
      const decoded = jwtDecode(token);
      const createdBy = decoded.id;
      
      try {
        const response = await axios.post("https://my-backend-v7fg.onrender.com/api/forums", 
          { title, description, createdBy },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.forums.push(response.data.forum);
      } catch (error) {
        console.error("Lỗi khi tạo diễn đàn:", error);
      }
    },

    async fetchPostById(id) {
      try {
        const response = await axios.get(`https://my-backend-v7fg.onrender.com/api/posts/${id}`);
        console.log("response post: ",response)
        this.currentPost = response.data;
      } catch (error) {
        console.error("Lỗi khi lấy thông tin bài viết:", error);
      }
    },

    async createPost(content, forumId) {
      const token = localStorage.getItem("token");
      if (!token) {
        alert("Bạn chưa đăng nhập!");
        return;
      }
      
      const decoded = jwtDecode(token);
      const createdBy = decoded.id;
      
      try {
        const response = await axios.post("https://my-backend-v7fg.onrender.com/api/posts", 
          { content, createdBy, forum: forumId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        this.posts.push(response.data.post);
      } catch (error) {
        console.error("Lỗi khi tạo bài viết:", error);
      }
    }
  }
});
