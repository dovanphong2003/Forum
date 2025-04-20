import { createRouter, createWebHistory } from "vue-router";
import Register from "../views/Register.vue";
import Login from "../views/Login.vue";
import Home from "../views/Home.vue";
import Protected from "../views/Protected.vue";
import Forums from "../views/Forums.vue";  // Import view danh sách diễn đàn
import ForumDetail from "../views/ForumDetail.vue";  // Import view chi tiết diễn đàn
import PostDetail from "../views/PostDetail.vue";  // Import view chi tiết bài viết
import StudentManagement from "../views/StudentManagement.vue";
const routes = [
  { path: "/", component: Home },

  // Trang đăng ký với kiểm tra nếu người dùng đã đăng nhập
  {
    path: "/register",
    component: Register,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");  // Kiểm tra token trong localStorage
      if (token) {
        next("/protected");  // Nếu token có trong localStorage, chuyển hướng tới trang bảo vệ
      } else {
        next();
      }
    },
  },

  // Trang đăng nhập với kiểm tra nếu người dùng đã đăng nhập
  {
    path: "/login",
    component: Login,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");  // Kiểm tra token trong localStorage
      if (token) {
        next("/protected");  // Nếu token có trong localStorage, chuyển hướng tới trang bảo vệ
      } else {
        next();
      }
    },
  },

  // Trang bảo vệ với kiểm tra nếu người dùng đã đăng nhập
  {
    path: "/protected",
    component: Protected,
    beforeEnter: (to, from, next) => {
      const token = localStorage.getItem("token");  // Kiểm tra token trong localStorage
      if (!token) {
        next("/login");  // Nếu không có token, chuyển hướng về trang login
      } else {
        next();
      }
    },
  },

  // Route cho danh sách diễn đàn
  {
    path: "/forums",
    component: Forums, // Trang danh sách diễn đàn
  },

  // Route cho chi tiết diễn đàn, với dynamic route parameter
  {
    path: "/forums/:id",  // Lấy thông tin diễn đàn qua `id`
    component: ForumDetail,  // Trang chi tiết diễn đàn
    props: true,  // Cho phép truyền `id` dưới dạng prop
  },

  // Route cho chi tiết bài viết, với dynamic route parameter
  {
    path: "/post/:id",  // Lấy thông tin bài viết qua `id`
    component: PostDetail,  // Trang chi tiết bài viết
    props: true,  // Cho phép truyền `id` dưới dạng prop
  },
  {
    path: "/management-student",  
    component: StudentManagement,  
    props: true,
    
  }
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
