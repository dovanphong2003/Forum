<template>
  <div class="app-container">
    <!-- Navbar -->
    <nav class="navbar">
      <div class="navbar-brand">
        <router-link to="/" class="brand-link">MyApp</router-link>
      </div>
      <div class="navbar-links">
        <router-link to="/" class="nav-link">Trang Chủ</router-link>
        <router-link v-if="!isAuthenticated" to="/register" class="nav-link">Đăng Ký</router-link>
        <router-link v-if="!isAuthenticated" to="/login" class="nav-link">Đăng Nhập</router-link>
        <router-link v-if="isAuthenticated" to="/protected" class="nav-link">Trang Cá Nhân</router-link>
        <router-link v-if="isAuthenticated" to="/forums" class="nav-link">Diễn Đàn</router-link>
        <router-link v-if="isAuthenticatedAdmin" to="/management-student" class="nav-link">Quản trị sinh viên</router-link>
        <button v-if="isAuthenticated" @click="handleLogout" class="logout-btn">Đăng Xuất</button>
      </div>
      <!-- Nút hamburger cho mobile -->
      <button class="hamburger" @click="toggleMenu" :class="{ 'is-active': menuOpen }">
        <span></span>
        <span></span>
        <span></span>
      </button>
      <!-- Menu mobile -->
      <transition name="slide">
        <div v-if="menuOpen" class="mobile-menu">
          <router-link to="/" class="nav-link" @click="toggleMenu">Trang Chủ</router-link>
          <router-link v-if="!isAuthenticated" to="/register" class="nav-link" @click="toggleMenu">Đăng Ký</router-link>
          <router-link v-if="!isAuthenticated" to="/login" class="nav-link" @click="toggleMenu">Đăng Nhập</router-link>
          <router-link v-if="isAuthenticated" to="/protected" class="nav-link" @click="toggleMenu">Trang Cá Nhân</router-link>
          <router-link v-if="isAuthenticated" to="/forums" class="nav-link" @click="toggleMenu">Diễn Đàn</router-link>
          <router-link v-if="isAuthenticatedAdmin" to="/management-student" class="nav-link">Quản trị sinh viên</router-link>
          <button v-if="isAuthenticated" @click="handleLogout" class="logout-btn mobile-logout">Đăng Xuất</button>
        </div>
      </transition>
    </nav>

    <!-- Nội dung chính -->
    <main class="content">
      <router-view />
    </main>
  </div>
</template>

<script setup>
import { computed, ref, onMounted } from "vue";
import { useAuthStore } from "./stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();
const menuOpen = ref(false);

// Kiểm tra trạng thái đăng nhập dựa trên store
const isAuthenticated = computed(() => auth.isAuthenticated);
const isAuthenticatedAdmin = computed(() => auth.isAdmin);
console.log("is auth:",isAuthenticated)
console.log("is admin:",isAuthenticatedAdmin)

// Toggle menu mobile
const toggleMenu = () => {
  menuOpen.value = !menuOpen.value;
};

// Xử lý đăng xuất
const handleLogout = async () => {
  if (confirm("Bạn có chắc muốn đăng xuất không?")) {
    try {
      auth.logout(); // Gọi action logout từ store
      router.push("/login"); // Chuyển hướng về trang đăng nhập
      window.location.reload(); // Thực hiện reload lại trang để cập nhật state và xóa thông tin người dùng
    } catch (error) {
      console.error("Lỗi khi đăng xuất:", error);
      alert("Đã có lỗi xảy ra khi đăng xuất.");
    }
  }
};


// Khôi phục trạng thái user khi reload
onMounted(async () => {
  if (!auth.user) {
    await auth.initialize(); // Khởi tạo và lấy thông tin user nếu token còn tồn tại
  }
});
</script>

<style scoped>
.app-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.navbar {
  background: #2c3e50;
  padding: 15px 30px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 1000;
}

.navbar-brand .brand-link {
  color: #ecf0f1;
  font-size: 1.5rem;
  font-weight: bold;
  text-decoration: none;
}

.navbar-links {
  display: flex;
  gap: 20px;
  align-items: center;
}

.nav-link {
  color: #ecf0f1;
  text-decoration: none;
  font-size: 1.1rem;
  transition: color 0.3s;
}

.nav-link:hover,
.nav-link.router-link-active {
  color: #3498db;
}

.logout-btn {
  background: #e74c3c;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.logout-btn:hover {
  background: #c0392b;
}

.hamburger {
  display: none;
  background: none;
  border: none;
  cursor: pointer;
  flex-direction: column;
  gap: 5px;
  padding: 5px;
}

.hamburger span {
  width: 25px;
  height: 3px;
  background: #ecf0f1;
  transition: all 0.3s;
}

.hamburger.is-active span:nth-child(1) {
  transform: rotate(45deg) translate(5px, 5px);
}

.hamburger.is-active span:nth-child(2) {
  opacity: 0;
}

.hamburger.is-active span:nth-child(3) {
  transform: rotate(-45deg) translate(7px, -7px);
}

.mobile-menu {
  position: absolute;
  top: 100%;
  left: 0;
  right: 0;
  background: #34495e;
  padding: 20px;
  display: flex;
  flex-direction: column;
  gap: 15px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.mobile-menu .nav-link {
  font-size: 1.2rem;
}

.mobile-logout {
  width: fit-content;
  margin-top: 10px;
}

.content {
  flex: 1;
  padding: 20px;
}

/* Animation */
.slide-enter-active,
.slide-leave-active {
  transition: transform 0.3s ease;
}

.slide-enter-from,
.slide-leave-to {
  transform: translateY(-100%);
}

/* Responsive */
@media (max-width: 768px) {
  .navbar-links {
    display: none;
  }

  .hamburger {
    display: flex;
  }
}
</style>