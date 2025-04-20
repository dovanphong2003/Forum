<template>
  <div class="forums-container">
    <h1 class="forums-title">Danh Sách Diễn Đàn</h1>

    <!-- Nút tạo chủ đề mới -->
    <div class="action-bar" v-if="isAuthenticated">
      <button @click="toggleCreateForm" class="btn-create">
        {{ showCreateForm ? 'Ẩn Form' : 'Tạo Chủ Đề Mới' }}
      </button>
    </div>

    <!-- Form tạo chủ đề -->
    <transition name="fade">
      <div v-if="showCreateForm" class="create-form card">
        <h2>Tạo Chủ Đề Mới</h2>
        <form @submit.prevent="createForum">
          <div class="form-group">
            <label for="title">Tiêu đề:</label>
            <input v-model="newForum.title" id="title" placeholder="Nhập tiêu đề" required />
          </div>
          <div class="form-group">
            <label for="description">Mô tả:</label>
            <textarea v-model="newForum.description" id="description" placeholder="Nhập mô tả" rows="4" required></textarea>
          </div>
          <button type="submit" class="btn-submit" :disabled="isLoading">
            {{ isLoading ? 'Đang Tạo...' : 'Tạo Chủ Đề' }}
          </button>
        </form>
      </div>
    </transition>

    <!-- Danh sách diễn đàn -->
    <div class="forum-list">
      <div v-if="forums.length === 0" class="no-forums">
        Chưa có diễn đàn nào được tạo.
      </div>
      <div v-else class="forum-grid">
        <div v-for="forum in forums" :key="forum._id" class="forum-card card">
          <h3>{{ forum.title }}</h3>
          <p>{{ forum.description }}</p>
          <p class="meta">Ngày tạo: {{ formatDate(forum.createdAt) }}</p>
          <router-link :to="`/forums/${forum._id}`" class="btn-view">Xem Chi Tiết</router-link>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { useForumStore } from "../stores/useForumStore";
import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";
import { ref, onMounted, computed } from "vue";
import { useRouter } from "vue-router";

export default {
  setup() {
    const forumStore = useForumStore();
    const authStore = useAuthStore();
    const router = useRouter();
    const { forums } = storeToRefs(forumStore);
    const showCreateForm = ref(false);
    const newForum = ref({ title: "", description: "" });
    const isLoading = ref(false);

    // Kiểm tra đăng nhập bằng token trong localStorage
    const isAuthenticated = computed(() => {
      const token = localStorage.getItem("token");
      return !!token; // Trả về true nếu có token
    });

    onMounted(async () => {
      try {
        await forumStore.fetchForums();
        // Nếu có token nhưng authStore chưa có user, fetch lại thông tin user
        if (isAuthenticated.value && !authStore.user) {
          await authStore.fetchUserFromToken();
        }
      } catch (error) {
        console.error("Lỗi khi tải danh sách diễn đàn:", error);
      }
    });

    const toggleCreateForm = () => {
      showCreateForm.value = !showCreateForm.value;
    };

    const createForum = async () => {
      if (!isAuthenticated.value) {
        alert("Vui lòng đăng nhập để tạo chủ đề mới.");
        router.push("/login");
        return;
      }

      if (!newForum.value.title.trim() || !newForum.value.description.trim()) {
        alert("Vui lòng nhập đầy đủ tiêu đề và mô tả.");
        return;
      }

      isLoading.value = true;
      try {
        await forumStore.createForum(newForum.value.title, newForum.value.description, authStore.user?._id);
        newForum.value = { title: "", description: "" };
        showCreateForm.value = false;
        alert("Tạo chủ đề thành công!");
      } catch (error) {
        console.error("Lỗi khi tạo chủ đề:", error);
        alert("Đã có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        isLoading.value = false;
      }
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    };

    return {
      forums,
      showCreateForm,
      newForum,
      createForum,
      isLoading,
      isAuthenticated,
      toggleCreateForm,
      formatDate,
    };
  },
};
</script>

<style scoped>
.forums-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
}

.forums-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.action-bar {
  text-align: right;
  margin-bottom: 20px;
}

.btn-create {
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-create:hover {
  background: #2980b9;
}

.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
}

.create-form {
  margin-bottom: 30px;
}

.create-form h2 {
  color: #34495e;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.form-group textarea {
  resize: vertical;
}

.btn-submit {
  background: #42b983;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-submit:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.btn-submit:hover:not(:disabled) {
  background: #379c6f;
}

.forum-list {
  margin-top: 20px;
}

.no-forums {
  text-align: center;
  color: #7f8c8d;
}

.forum-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 20px;
}

.forum-card {
  transition: transform 0.2s;
}

.forum-card:hover {
  transform: translateY(-5px);
}

.forum-card h3 {
  margin: 0 0 10px;
  color: #2c3e50;
}

.forum-card p {
  color: #555;
  margin: 5px 0;
}

.meta {
  font-size: 0.9em;
  color: #7f8c8d;
}

.btn-view {
  display: inline-block;
  background: #e67e22;
  color: white;
  padding: 8px 15px;
  border-radius: 5px;
  text-decoration: none;
  transition: background 0.3s;
}

.btn-view:hover {
  background: #d35400;
}

/* Animation */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media (max-width: 768px) {
  .forum-grid {
    grid-template-columns: 1fr;
  }
}
</style>