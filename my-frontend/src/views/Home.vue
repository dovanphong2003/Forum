<template>
  <div class="home-container">
    <h1>Trang Chủ</h1>
    <p>Chào mừng bạn đến với diễn đàn sinh viên đi top!</p>

    <section class="system-info">
      <h2>Thông tin hệ thống</h2>
      <ul>
        <li><strong>Chức năng:</strong> Quản lý bài viết, diễn đàn thảo luận, đăng ký, đăng nhập, và các bình luận của sinh viên.</li>
        <li><strong>Được phát triển bởi:</strong> Nhóm sinh viên chuyên đi Top.</li>
        <li><strong>Hệ thống hoạt động:</strong> Hỗ trợ cả web và ứng dụng di động, giúp sinh viên dễ dàng tham gia và học hỏi.</li>
        <li><strong>Liên hệ:</strong> Để hỗ trợ, vui lòng liên hệ qua email: support@universityforum.com</li>
      </ul>
    </section>

    <section class="notifications">
      <h2>Thông báo</h2>
      <ul>
        <li><strong>Chú ý:</strong> Hệ thống sẽ bảo trì vào tối thứ 6, từ 10:00 PM đến 12:00 AM.</li>
        <li><strong>Thông báo mới:</strong> Các bài viết thảo luận về các môn học sẽ được cập nhật thường xuyên.</li>
        <li><strong>Cập nhật:</strong> Phiên bản mới của hệ thống đã có mặt với tính năng cải tiến trong việc đăng bài và tìm kiếm diễn đàn.</li>
      </ul>
    </section>

    <section class="call-to-action">
      <h2>Tham gia diễn đàn ngay!</h2>
      <p>Hãy tham gia các diễn đàn để thảo luận và chia sẻ kiến thức với các sinh viên khác.</p>
      <button @click="goToForum">Truy cập diễn đàn</button>
    </section>
  </div>
</template>

<script setup>
// Hàm để chuyển hướng tới trang diễn đàn nếu người dùng nhấn vào nút
import { useRouter } from "vue-router";
const router = useRouter();

const goToForum = () => {
  router.push("/forums");  // Chuyển hướng tới trang diễn đàn
};
</script>

<style scoped>
.home-container {
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

h2 {
  color: #2c3e50;
  margin-top: 20px;
}

ul {
  list-style-type: none;
  padding: 0;
}

ul li {
  margin: 10px 0;
}

strong {
  font-weight: bold;
}

.system-info, .notifications, .call-to-action {
  background-color: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  margin-top: 20px;
}

.system-info {
  border-left: 5px solid #3498db;
}

.notifications {
  border-left: 5px solid #e74c3c;
}

.call-to-action {
  text-align: center;
  border-left: 5px solid #2ecc71;
}

button {
  padding: 10px 20px;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

button:hover {
  background-color: #2980b9;
}
</style>
