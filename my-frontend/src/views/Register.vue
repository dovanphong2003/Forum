<template>
  <div class="register-container">
    <h2>Đăng ký</h2>
    <form @submit.prevent="register">
      <input v-model="username" placeholder="Username" required />
      <input v-model="name" placeholder="Họ tên" required />
      <input v-model="email" type="email" placeholder="Email" required />
      <input v-model="password" type="password" placeholder="Mật khẩu" required />
      <input v-model="phoneNumber" placeholder="Số điện thoại" required />
      <input v-model="dateOfBirth" type="date" placeholder="Ngày sinh" required />
      <button type="submit" :disabled="isLoading">
        {{ isLoading ? "Đang đăng ký..." : "Đăng ký" }}
      </button>
    </form>
    <p v-if="errorMessage" class="error">{{ errorMessage }}</p>
    <p>Đã có tài khoản? <router-link to="/login">Đăng nhập</router-link></p>
  </div>
</template>

<script setup>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth";
import { useRouter } from "vue-router";

const auth = useAuthStore();
const router = useRouter();
const username = ref("");
const name = ref("");
const email = ref("");
const password = ref("");
const phoneNumber = ref("");
const dateOfBirth = ref("");
const errorMessage = ref("");
const isLoading = ref(false);

const register = async () => {
  errorMessage.value = "";
  isLoading.value = true;
  try {
    await auth.register(username.value, name.value, email.value, password.value, phoneNumber.value, dateOfBirth.value);
    // Sau khi đăng ký thành công, chuyển hướng đến trang đăng nhập
    router.push("/login").then(() => {
  location.reload(); // Reload lại toàn bộ trang sau khi chuyển
});

  } catch (error) {
    errorMessage.value = error.response?.data?.message || "Đăng ký thất bại!";
  } finally {
    isLoading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: auto;
  padding: 20px;
  border: 1px solid #ddd;
  border-radius: 5px;
  box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1);
  background-color: #f9f9f9;
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
  background-color: #28a745;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #218838;
}

.error {
  color: red;
  font-size: 14px;
}

.success {
  color: green;
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
