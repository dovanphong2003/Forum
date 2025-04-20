<template>
  <div class="post-detail-container">
    <!-- Trạng thái tải -->
    <div v-if="isLoading" class="loading">Đang tải bài viết...</div>

    <!-- Nội dung bài viết -->
    <div v-else-if="post" class="post-wrapper">
      <section class="post-content card">
        <h2 class="post-title">{{ post.content }}</h2>
        <div class="post-meta">
          <p>Được tạo bởi: <span class="username">{{ post.createdBy?.username || "Ẩn danh" }}</span></p>
          <p>Ngày tạo: {{ formatDate(post.createdAt) }}</p>
        </div>
      </section>

      <!-- Danh sách bình luận -->
      <section class="comments-section card">
        <h3>Bình Luận</h3>
        <div v-if="commentTree.length" class="comment-list">
          <p>Rendering {{ commentTree.length }} comments</p>
          <comment-item
            v-for="comment in commentTree"
            :key="comment._id"
            :comment="comment"
            :level="0"
            @reply="startReply"
          />
        </div>
        <p v-else class="no-comments">Chưa có bình luận nào.</p>

        <!-- Form thêm bình luận cấp cao nhất -->
        <div v-if="isAuthenticated && !replyingTo" class="comment-form">
          <h4>Viết Bình Luận</h4>
          <form @submit.prevent="addComment(null)">
            <textarea
              v-model="newComment"
              placeholder="Viết bình luận của bạn..."
              :disabled="isLoading"
              rows="3"
              class="comment-input"
            ></textarea>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              @change="onImageChange"
              :disabled="isLoading"
              class="image-input"
            />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Image Preview" />
              <button type="button" @click="clearImage" class="btn-clear-image">Xóa hình ảnh</button>
            </div>
            <button
              type="submit"
              class="btn-submit"
              :disabled="isLoading || (!newComment.trim() && !selectedImage)"
            >
              {{ isLoading ? "Đang Gửi..." : "Gửi Bình Luận" }}
            </button>
          </form>
        </div>

        <!-- Form trả lời bình luận -->
        <div v-if="isAuthenticated && replyingTo" class="comment-form reply-form">
          <h4>Trả lời {{ replyingTo.createdBy?.username || "Ẩn danh" }}</h4>
          <form @submit.prevent="addComment(replyingTo._id)">
            <textarea
              v-model="newComment"
              :placeholder="`Trả lời ${replyingTo.createdBy?.username || 'Ẩn danh'}...`"
              :disabled="isLoading"
              rows="3"
              class="comment-input"
            ></textarea>
            <input
              type="file"
              accept="image/jpeg,image/jpg,image/png"
              @change="onImageChange"
              :disabled="isLoading"
              class="image-input"
            />
            <div v-if="imagePreview" class="image-preview">
              <img :src="imagePreview" alt="Image Preview" />
              <button type="button" @click="clearImage" class="btn-clear-image">Xóa hình ảnh</button>
            </div>
            <button
              type="submit"
              class="btn-submit"
              :disabled="isLoading || (!newComment.trim() && !selectedImage)"
            >
              {{ isLoading ? "Đang Gửi..." : "Gửi Trả Lời" }}
            </button>
            <button type="button" class="btn-cancel" @click="cancelReply">Hủy</button>
          </form>
        </div>
      </section>
    </div>

    <!-- Trường hợp không tìm thấy bài viết -->
    <div v-else class="not-found">Không tìm thấy bài viết.</div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useForumStore } from "../stores/useForumStore";
import { useAuthStore } from "../stores/auth";
import { storeToRefs } from "pinia";
import axios from "axios";
import CommentItem from "../components/CommentItem.vue";

export default {
  components: { CommentItem },
  setup() {
    const route = useRoute();
    const router = useRouter();
    const forumStore = useForumStore();
    const authStore = useAuthStore();
    const { currentPost: post } = storeToRefs(forumStore);
    const newComment = ref("");
    const isLoading = ref(false);
    const replyingTo = ref(null);
    const selectedImage = ref(null);
    const imagePreview = ref(null);

    const isAuthenticated = computed(() => authStore.isAuthenticated);

    const loadPost = async () => {
      isLoading.value = true;
      try {
        await authStore.initialize();
        await forumStore.fetchPostById(route.params.id);
        console.log("Post loaded:", post.value);
        if (!post.value) throw new Error("Post not found");
        post.value.comments = post.value.comments || [];
      } catch (error) {
        console.error("Lỗi khi tải bài viết:", error);
        router.push("/forums");
      } finally {
        isLoading.value = false;
      }
    };

    const commentTree = computed(() => {
      if (!post.value || !post.value.comments) return [];
      const comments = JSON.parse(JSON.stringify(post.value.comments));
      const tree = [];
      const map = new Map();

      comments.forEach((comment) => {
        comment.children = [];
        map.set(comment._id.toString(), comment);
      });

      comments.forEach((comment) => {
        if (comment.parent) {
          const parent = map.get(comment.parent.toString());
          if (parent && !parent.children.some(child => child._id === comment._id)) {
            parent.children.push(comment);
          }
        } else {
          tree.push(comment);
        }
      });

      console.log("Comment tree:", tree);
      return tree;
    });

    const onImageChange = (event) => {
      const file = event.target.files[0];
      if (file) {
        if (file.size > 500 * 1024) {
          alert("Hình ảnh phải nhỏ hơn 500KB!");
          return;
        }
        selectedImage.value = file;
        imagePreview.value = URL.createObjectURL(file);
      } else {
        selectedImage.value = null;
        imagePreview.value = null;
      }
    };

    const clearImage = () => {
      selectedImage.value = null;
      imagePreview.value = null;
    };

    const addComment = async (parentId) => {
      if (!isAuthenticated.value) {
        alert("Vui lòng đăng nhập để bình luận.");
        router.push("/login");
        return;
      }

      if (!newComment.value.trim() && !selectedImage.value) {
        alert("Vui lòng nhập nội dung hoặc chọn hình ảnh.");
        return;
      }

      isLoading.value = true;
      try {
        if (!authStore.user) await authStore.fetchUser();
        const formData = new FormData();
        formData.append("content", newComment.value);
        formData.append("createdBy", authStore.user._id);
        formData.append("post", post.value._id);
        if (parentId) formData.append("parent", parentId);
        if (selectedImage.value) formData.append("image", selectedImage.value);

        const response = await axios.post("https://my-backend-v7fg.onrender.com/api/comments", formData, {
          headers: {
            Authorization: `Bearer ${authStore.token}`,
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Comment response:", response.data);
        const newCommentData = response.data.comment;
        newCommentData.createdBy = { _id: authStore.user._id, username: authStore.user.username };
        post.value.comments.push(newCommentData);
        newComment.value = "";
        selectedImage.value = null;
        imagePreview.value = null;
        replyingTo.value = null;
        alert("Bình luận đã được gửi thành công!");
      } catch (error) {
        console.error("Lỗi khi thêm bình luận:", error);
        alert("Đã có lỗi xảy ra, vui lòng thử lại.");
      } finally {
        isLoading.value = false;
      }
    };

    const startReply = (comment) => {
      replyingTo.value = comment;
      newComment.value = "";
      clearImage();
    };

    const cancelReply = () => {
      replyingTo.value = null;
      newComment.value = "";
      clearImage();
    };

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    onMounted(loadPost);

    return {
      post,
      newComment,
      addComment,
      isLoading,
      isAuthenticated,
      formatDate,
      commentTree,
      replyingTo,
      startReply,
      cancelReply,
      onImageChange,
      imagePreview,
      clearImage,
    };
  },
};
</script>

<style scoped>
.post-detail-container {
  max-width: 900px;
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

.loading,
.not-found,
.no-comments {
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
}

.post-title {
  color: #2c3e50;
  margin-bottom: 15px;
  font-size: 1.8rem;
}

.post-meta {
  display: flex;
  justify-content: space-between;
  color: #555;
  font-size: 0.9em;
}

.username {
  font-weight: bold;
  color: #34495e;
}

.comments-section h3,
.comment-form h4 {
  color: #34495e;
  margin-bottom: 20px;
}

.comment-list {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.comment-form {
  margin-top: 20px;
}

.comment-form .comment-input {
  width: 100%;
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
  resize: vertical;
  margin-bottom: 15px;
}

.image-input {
  margin-bottom: 15px;
}

.image-preview {
  margin-bottom: 15px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.image-preview img {
  max-width: 200px;
  max-height: 200px;
  object-fit: cover;
  border-radius: 5px;
}

.btn-clear-image {
  background: #e74c3c;
  color: white;
  border: none;
  padding: 5px 10px;
  border-radius: 5px;
  cursor: pointer;
}

.btn-clear-image:hover {
  background: #c0392b;
}

.btn-submit {
  background: #3498db;
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
  background: #2980b9;
}

.btn-cancel {
  background: #e74c3c;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  margin-left: 10px;
  transition: background 0.3s;
}

.btn-cancel:hover {
  background: #c0392b;
}

.reply-form {
  background: #f1f1f1;
  padding: 15px;
  border-radius: 5px;
}

@media (max-width: 768px) {
  .post-detail-container {
    padding: 10px;
  }

  .post-meta {
    flex-direction: column;
    gap: 5px;
  }
}
</style>