import { defineStore } from "pinia";
import axios from "axios";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    user: null,
    token: localStorage.getItem("token") || "",
    role: localStorage.getItem("role") || "", // Lưu role
  }),

  getters: {
    isAuthenticated: (state) => {
      console.log("token: ",state.token);
      return !!state.token && !!state.user;
    },
    isAdmin: (state) => {
      console.log("state: ", state.role);
      return state.role === "admin"
    }, // Kiểm tra admin
  },

  actions: {
    async register(username, name, email, password, phoneNumber, dateOfBirth) {
      try {
        const response = await axios.post("http://localhost:5000/api/auth/register", {
          username,
          name,
          email,
          password,
          phoneNumber,
          dateOfBirth,
        });
        this.token = response.data.token;
        localStorage.setItem("token", this.token);
        return response.data;
      } catch (error) {
        console.log("error: ", error);
        throw error;
      }
    },

    async login(email, password) {
      try {
        const response = await axios.post("http://localhost:5000/api/auth/login", {
          email,
          password,
        });
        this.user = response.data.user;
        this.token = response.data.token;
        this.role = response.data.role; // Lưu role
        localStorage.setItem("token", this.token);
        localStorage.setItem("role", this.role); // Lưu role vào localStorage
      } catch (error) {
        console.error("Login failed:", error);
        throw error;
      }
    },

    async fetchUser() {
      if (this.token) {
        try {
          const response = await axios.get("http://localhost:5000/api/auth/protected", {
            headers: { Authorization: `Bearer ${this.token}` },
          });
          this.user = response.data.user;
          this.role = response.data.user.role; // Cập nhật role
          localStorage.setItem("role", this.role);
        } catch (error) {
          this.user = null;
          this.role = "";
          localStorage.removeItem("role");
        }
      }
    },

    logout() {
      this.user = null;
      this.token = "";
      this.role = "";
      localStorage.removeItem("token");
      localStorage.removeItem("role");
    },

    async initialize() {
      if (this.token) {
        await this.fetchUser();
      }
    },
  },
});