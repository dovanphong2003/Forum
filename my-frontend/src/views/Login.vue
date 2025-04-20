<template>
  <div class="login-container">
    <h2>Đăng nhập</h2>
    <form @submit.prevent="login">
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Mật khẩu" required />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Đang đăng nhập..." : "Đăng nhập" }}
      </button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p>Chưa có tài khoản? <router-link to="/register">Đăng ký</router-link></p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";  // Import useRouter

const auth = useAuthStore();
const router = useRouter();  // Khai báo router
const email = ref("");
const password = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const login = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    // Gọi action login từ authStore
    await auth.login(email.value, password.value);

    // Đảm bảo rằng user được xác thực sau khi đăng nhập và token đã được lưu vào localStorage
    if (auth.user) {
      router.push("/protected");  // Chuyển hướng đến trang bảo vệ sau khi đăng nhập thành công
    } else {
      errorMessage.value = "Đăng nhập thất bại!";
    }
  } catch (error) {
    console.log("error: ",error)
    errorMessage.value = error.response?.data?.message || "Đăng nhập thất bại!";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
/* CSS remains the same */
.login-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #fff;
}

h2 {
  text-align: center;
  margin-bottom: 20px;
}

input {
  display: block;
  width: 100%;
  margin: 10px 0;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 14px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:disabled {
  background-color: #ccc;
}

.error {
  color: red;
  font-size: 14px;
}

p {
  text-align: center;
}

a {
  color: #007bff;
  text-decoration: none;
}

a:hover {
  text-decoration: underline;
}
</style>
