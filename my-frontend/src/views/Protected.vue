<template>
  <div class="profile-container">
    <h1 class="profile-title">Trang Cá Nhân</h1>

    <!-- Trạng thái tải -->
    <div v-if="isLoading" class="loading">Đang tải thông tin...</div>

    <!-- Thông tin cá nhân -->
    <section v-else class="profile-info card">
      <h2>Thông Tin Cá Nhân</h2>
      <form @submit.prevent="updateProfile" class="profile-form">
        <div class="form-group">
          <label for="name">Tên:</label>
          <input v-model="student.name" type="text" id="name" required />
        </div>
        <div class="form-group">
          <label for="email">Email:</label>
          <input v-model="student.email" type="email" id="email" required disabled />
        </div>
        <div class="form-group">
          <label for="phoneNumber">Số điện thoại:</label>
          <input v-model="student.phoneNumber" type="text" id="phoneNumber" />
        </div>
        <div class="form-group">
          <label for="dateOfBirth">Ngày sinh:</label>
          <input v-model="formattedDateOfBirth" type="date" id="dateOfBirth" />
        </div>
        <div class="form-group">
          <label for="password">Mật khẩu mới:</label>
          <input
            v-model="student.password"
            type="password"
            id="password"
            placeholder="Để trống nếu không đổi"
          />
        </div>
        <button type="submit" class="btn-update" :disabled="isLoading">
          {{ isLoading ? "Đang Cập Nhật..." : "Cập Nhật Thông Tin" }}
        </button>
      </form>
      <p class="role">Vai trò: {{ student.role || "Không xác định" }}</p>
    </section>

    <!-- Khóa học đã đăng ký -->
    <section v-if="!isLoading" class="enrolled-courses card">
      <h2>Khóa Học Đã Đăng Ký</h2>
      <p v-if="!student.enrolledCourses || student.enrolledCourses.length === 0">
        Bạn chưa đăng ký khóa học nào.
      </p>
      <ul v-else>
        <li v-for="course in student.enrolledCourses" :key="course">{{ course }}</li>
      </ul>
    </section>

    <!-- Bài viết của bạn -->
    <section v-if="!isLoading" class="student-content card">
      <h2>Bài Viết Của Bạn</h2>
      <div v-if="posts.length === 0">Bạn chưa có bài viết nào.</div>
      <div v-else class="post-list">
        <div v-for="post in posts" :key="post._id" class="post-item">
          <h3>{{ post.content }}</h3>
          <p><strong>Diễn đàn:</strong> {{ post.forum?.title || "Không xác định" }}</p>
          <p><strong>Ngày đăng:</strong> {{ formatDate(post.createdAt) }}</p>
          <div class="comments">
            <strong>Bình luận:</strong>
            <ul v-if="post.comments?.length > 0">
              <li v-for="comment in post.comments" :key="comment._id">
                {{ comment.content }} ({{ formatDate(comment.createdAt) }})
              </li>
            </ul>
            <p v-else>Chưa có bình luận.</p>
          </div>
          <button class="btn-view" @click="viewPost(post._id)">Xem chi tiết</button>
        </div>
      </div>
    </section>

    <!-- Chủ đề của bạn -->
    <section v-if="!isLoading" class="student-content card">
      <h2>Chủ Đề Của Bạn</h2>
      <div v-if="forums.length === 0">Bạn chưa tạo chủ đề nào.</div>
      <div v-else class="forum-list">
        <div v-for="forum in forums" :key="forum._id" class="forum-item">
          <h3>{{ forum.title }}</h3>
          <p>{{ forum.description }}</p>
          <p><strong>Ngày tạo:</strong> {{ formatDate(forum.createdAt) }}</p>
          <p><strong>Số bài viết:</strong> {{ forum.posts?.length || 0 }}</p>
          <button class="btn-view" @click="viewForum(forum._id)">Xem chi tiết</button>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { ref, onMounted, computed, watch } from "vue";
import { useStudentStore } from "../stores/useStudentStore";
import { useRouter } from "vue-router";

export default {
  name: "ProfilePage",
  setup() {
    const store = useStudentStore();
    const router = useRouter();
    const student = ref({ password: "" });
    const posts = ref([]);
    const forums = ref([]);
    const isLoading = ref(false);

    // Kiểm tra token từ store
    const isAuthenticated = computed(() => {
      return !!store.token;
    });

    // Hàm tải dữ liệu
    const loadData = async () => {
      isLoading.value = true;
      try {
        await store.fetchStudentInfo();
        student.value = { ...store.student, password: "" };
        console.log("store student: ", store.student);

        await store.fetchStudentPosts();
        posts.value = store.posts || [];

        await store.fetchStudentForums();
        forums.value = store.forums || [];
      } catch (error) {
        console.error("Lỗi khi tải dữ liệu:", error);
        store.logout(); // Reset state và xóa token
        router.push("/login");
      } finally {
        isLoading.value = false;
      }
    };

    // Tải dữ liệu khi mounted
    onMounted(() => {
      if (!isAuthenticated.value) {
        router.push("/login");
      } else {
        loadData();
      }
    });

    // Theo dõi token để làm mới dữ liệu khi đăng nhập nick khác
    watch(
      () => store.token,
      (newToken) => {
        if (newToken && newToken !== "") {
          loadData(); // Tải lại dữ liệu khi token thay đổi
        }
      }
    );

    const updateProfile = async () => {
      if (!isAuthenticated.value) {
        alert("Vui lòng đăng nhập lại.");
        router.push("/login");
        return;
      }

      isLoading.value = true;
      try {
        const profileData = { ...student.value };
        if (!profileData.password) {
          delete profileData.password;
        }
        console.log("profile: ", profileData);

        await store.updateStudentInfo(profileData);
        alert("Cập nhật thành công!");
      } catch (error) {
        alert("Cập nhật thất bại: " + (error.message || "Lỗi không xác định"));
        console.error(error);
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

    const formattedDateOfBirth = computed({
      get: () =>
        student.value.dateOfBirth
          ? new Date(student.value.dateOfBirth).toISOString().split("T")[0]
          : "",
      set: (value) => (student.value.dateOfBirth = value),
    });

    const viewPost = (postId) => {
      router.push(`/post/${postId}`);
    };

    const viewForum = (forumId) => {
      router.push(`/forum/${forumId}`);
    };

    return {
      student,
      posts,
      forums,
      updateProfile,
      formatDate,
      formattedDateOfBirth,
      viewPost,
      viewForum,
      isLoading,
    };
  },
};
</script>

<style scoped>
.profile-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
  font-family: "Arial", sans-serif;
}

.profile-title {
  text-align: center;
  color: #2c3e50;
  margin-bottom: 30px;
}

.card {
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  padding: 20px;
  margin-bottom: 30px;
}

.loading {
  text-align: center;
  color: #7f8c8d;
  padding: 20px;
}

.profile-info h2,
.student-content h2 {
  color: #34495e;
  margin-bottom: 20px;
}

.profile-form {
  display: grid;
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-weight: bold;
  margin-bottom: 5px;
}

.form-group input {
  padding: 10px;
  border: 1px solid #ddd;
  border-radius: 5px;
  font-size: 16px;
}

.btn-update {
  background: #3498db;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-update:hover:not(:disabled) {
  background: #2980b9;
}

.btn-update:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.role {
  margin-top: 10px;
  color: #7f8c8d;
}

.enrolled-courses ul {
  list-style: none;
  padding: 0;
}

.enrolled-courses li {
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.post-list,
.forum-list {
  display: grid;
  gap: 20px;
}

.post-item,
.forum-item {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  transition: transform 0.2s;
}

.post-item:hover,
.forum-item:hover {
  transform: translateY(-3px);
}

.post-item h3,
.forum-item h3 {
  margin: 0 0 10px;
  color: #2c3e50;
}

.comments ul {
  list-style: none;
  padding: 0;
  margin: 10px 0;
}

.comments li {
  padding: 5px 0;
  color: #555;
}

.btn-view {
  background: #e67e22;
  color: white;
  padding: 8px 15px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  transition: background 0.3s;
}

.btn-view:hover {
  background: #d35400;
}

@media (max-width: 768px) {
  .profile-form,
  .post-list,
  .forum-list {
    grid-template-columns: 1fr;
  }
}
</style>