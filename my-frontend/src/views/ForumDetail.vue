<template>
  <div class="forum-detail-container">
    <!-- Tiêu đề và mô tả diễn đàn -->
    <header class="forum-header card">
      <h1 class="forum-title">{{ forum?.title || "Diễn Đàn" }}</h1>
      <p class="forum-description">{{ forum?.description || "Chưa có mô tả." }}</p>
      <p class="forum-meta">
        Tạo bởi: {{ forum?.createdBy?.username || "Ẩn danh" }} | Ngày tạo: {{ formatDate(forum?.createdAt) }}
      </p>
    </header>

    <!-- Danh sách bài viết -->
    <section class="posts-section card">
      <h2>Danh Sách Bài Viết</h2>
      <div v-if="isLoading" class="loading">Đang tải bài viết...</div>
      <div v-else-if="posts.length" class="post-list">
        <div v-for="post in posts" :key="post._id" class="post-item">
          <p class="post-content">{{ post.content }}</p>
          <div class="post-meta">
            <small>Đăng bởi: {{ post.createdBy?.username || "ID private: " + post.createdBy.substring(0,7) + " -- " + "SV Ẩn danh" }}</small>
            <small>Ngày đăng: {{ formatDate(post.createdAt) }}</small>
          </div>
          <button class="btn-view" @click="viewPost(post._id)">Xem chi tiết</button>
        </div>
      </div>
      <p v-else class="no-posts">Chưa có bài viết nào trong diễn đàn này.</p>
    </section>

    <!-- Form tạo bài viết mới -->
    <section v-if="isAuthenticated" class="create-post card">
      <h3>Viết Bài Mới</h3>
      <form @submit.prevent="createPost">
        <textarea
          v-model="newPostContent"
          placeholder="Nhập nội dung bài viết của bạn..."
          :disabled="isLoading"
          rows="4"
        ></textarea>
        <button type="submit" class="btn-submit" :disabled="isLoading || !newPostContent.trim()">
          {{ isLoading ? "Đang Đăng..." : "Đăng Bài" }}
        </button>
      </form>
    </section>

    <!-- Form tạo bình luận -->
    <section v-if="isAuthenticated && selectedPostId" class="create-comment card">
      <h3>Viết Bình Luận</h3>
      <form @submit.prevent="createComment">
        <textarea
          v-model="newCommentContent"
          placeholder="Nhập bình luận của bạn..."
          :disabled="isLoading"
          rows="3"
        ></textarea>
        <button type="submit" class="btn-submit" :disabled="isLoading || !newCommentContent.trim()">
          {{ isLoading ? "Đang Gửi..." : "Gửi Bình Luận" }}
        </button>
      </form>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useForumStore } from "../stores/useForumStore";
import { useAuthStore } from "../stores/auth";
import axios from "axios";

export default {
  setup() {
    const route = useRoute();
    const router = useRouter();
    const forumStore = useForumStore();
    const authStore = useAuthStore();
    const forum = ref(null);
    const posts = ref([]);
    const newPostContent = ref("");
    const newCommentContent = ref("");
    const selectedPostId = ref(null);
    const isLoading = ref(false);

    // Kiểm tra đăng nhập từ authStore
    const isAuthenticated = computed(() => authStore.isAuthenticated);

    // Lấy thông tin diễn đàn
    const fetchForum = async () => {
      isLoading.value = true;
      try {
        console.log("1");
        await forumStore.fetchForumById(route.params.id);
        console.log("forum store: ",forumStore);
        forum.value = forumStore.currentForum;
        posts.value = forumStore.posts || [];
        console.log('post: ',forumStore.posts)
      } catch (error) {
        console.error("Lỗi khi tải diễn đàn:", error);
        router.push("/forums");
      } finally {
        isLoading.value = false;
      }
    };

    // Tạo bài viết mới
    const createPost = async () => {
      if (!isAuthenticated.value) {
        alert("Vui lòng đăng nhập để đăng bài viết.");
        router.push("/login");
        return;
      }

      if (!newPostContent.value.trim()) {
        alert("Vui lòng nhập nội dung bài viết.");
        return;
      }

      isLoading.value = true;
      try {
        // Đảm bảo user đã được fetch
        if (!authStore.user) await authStore.fetchUser();
        await forumStore.createPost(newPostContent.value, route.params.id);
        newPostContent.value = "";
        posts.value = forumStore.posts; // Cập nhật danh sách bài viết
        alert("Đăng bài thành công!");
      } catch (error) {
        console.error("Lỗi khi tạo bài viết:", error);
        alert("Đã có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        isLoading.value = false;
      }
    };

    // Tạo bình luận mới
    const createComment = async () => {
      if (!isAuthenticated.value) {
        alert("Vui lòng đăng nhập để bình luận.");
        router.push("/login");
        return;
      }

      if (!newCommentContent.value.trim()) {
        alert("Vui lòng nhập nội dung bình luận.");
        return;
      }

      isLoading.value = true;
      try {
        if (!authStore.user) await authStore.fetchUser();
        const commentData = {
          content: newCommentContent.value,
          createdBy: authStore.user._id,
          post: selectedPostId.value,
        };
        const response = await axios.post("http://localhost:5000/api/comments", commentData, {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        // Cập nhật danh sách bình luận trong bài viết
        const postIndex = posts.value.findIndex((p) => p._id === selectedPostId.value);
        if (postIndex !== -1) {
          posts.value[postIndex].comments = posts.value[postIndex].comments || [];
          posts.value[postIndex].comments.push(response.data.comment);
        }
        newCommentContent.value = "";
        alert("Bình luận thành công!");
      } catch (error) {
        console.error("Lỗi khi tạo bình luận:", error);
        alert("Đã có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        isLoading.value = false;
      }
    };

    // Chuyển hướng đến chi tiết bài viết
    const viewPost = (postId) => {
      selectedPostId.value = postId; // Chọn bài viết để bình luận
      router.push(`/post/${postId}`);
    };

    // Format ngày tháng
    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Khởi tạo dữ liệu khi mounted
    onMounted(async () => {
      await authStore.initialize(); // Khôi phục trạng thái auth
      await fetchForum();
      console.log("chay on mount")
    });

    return {
      forum,
      posts,
      newPostContent,
      newCommentContent,
      selectedPostId,
      createPost,
      createComment,
      isLoading,
      isAuthenticated,
      formatDate,
      viewPost,
    };
  },
};
</script>

<style scoped>
.forum-detail-container {
  max-width: 1000px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
}

.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.forum-header {
  text-align: center;
}

.forum-title {
  color: #2c3e50;
  margin-bottom: 10px;
}

.forum-description {
  color: #555;
  font-size: 1.1em;
}

.forum-meta {
  color: #7f8c8d;
  font-size: 0.9em;
}

.posts-section h2,
.create-post h3,
.create-comment h3 {
  color: #34495e;
  margin-bottom: 20px;
}

.loading,
.no-posts {
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
}

.post-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.post-item {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  transition: transform 0.2s;
}

.post-item:hover {
  transform: translateY(-3px);
}

.post-content {
  margin: 0 0 10px;
  color: #333;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  font-size: 0.9em;
  color: #7f8c8d;
}

.create-post textarea,
.create-comment textarea {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  resize: vertical;
  margin-bottom: 15px;
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

.btn-view {
  background: #e67e22;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-top: 10px;
  transition: background 0.3s;
}

.btn-view:hover {
  background: #d35400;
}

@media (max-width: 768px) {
  .forum-detail-container {
    padding: 10px;
  }

  .post-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>