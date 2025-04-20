<template>
    <div>
      <h2>Chào mừng, {{ authStore.user?.username }}</h2>
      <p>Email: {{ authStore.user?.email }}</p>
      <button @click="authStore.logout">Đăng xuất</button>
    </div>
  </template>
  
  <script setup>
  import { onMounted } from "vue";
  import { useAuthStore } from "../stores/auth";
  
  const authStore = useAuthStore();
  
  onMounted(() => {
    authStore.fetchUser();
  });
  </script>
  