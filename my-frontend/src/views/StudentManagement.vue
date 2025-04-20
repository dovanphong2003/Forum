<template>
  <div class="student-management">
    <h2>Quản lý sinh viên</h2>

    <!-- Kiểm tra quyền admin -->
    <div v-if="authStore.isAdmin">
      <!-- Form thêm/sửa sinh viên -->
      <div class="form-container">
        <h3>{{ editingStudent ? 'Sửa sinh viên' : 'Thêm sinh viên' }}</h3>
        <form @submit.prevent="submitStudent" class="student-form">
          <div class="form-group">
            <label>Username</label>
            <input
              v-model="form.username"
              type="text"
              required
            />
          </div>
          <div class="form-group">
            <label>Họ tên</label>
            <input
              v-model="form.name"
              type="text"
              required
            />
          </div>
          <div class="form-group">
            <label>Email</label>
            <input
              v-model="form.email"
              type="email"
              required
            />
          </div>
          <div class="form-group" v-if="!editingStudent">
            <label>Mật khẩu</label>
            <input
              v-model="form.password"
              type="password"
              required
            />
          </div>
          <div class="form-group">
            <label>Số điện thoại</label>
            <input
              v-model="form.phoneNumber"
              type="text"
            />
          </div>
          <div class="form-group">
            <label>Ngày sinh</label>
            <input
              v-model="form.dateOfBirth"
              type="date"
            />
          </div>
          <div class="form-group">
            <label>Vai trò</label>
            <select v-model="form.role">
              <option value="student">Student</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div class="form-actions">
            <button type="submit">{{ editingStudent ? 'Cập nhật' : 'Thêm' }}</button>
            <button
              v-if="editingStudent"
              type="button"
              @click="cancelEdit"
              class="cancel-btn"
            >
              Hủy
            </button>
          </div>
        </form>
      </div>

      <!-- Danh sách sinh viên -->
      <div class="table-container">
        <table>
          <thead>
            <tr>
              <th>Username</th>
              <th>Họ tên</th>
              <th>Email</th>
              <th>Số điện thoại</th>
              <th>Ngày sinh</th>
              <th>Vai trò</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="student in students" :key="student._id">
              <td>{{ student.username }}</td>
              <td>{{ student.name }}</td>
              <td>{{ student.email }}</td>
              <td>{{ student.phoneNumber || '-' }}</td>
              <td>{{ formatDate(student.dateOfBirth) || '-' }}</td>
              <td>{{ student.role }}</td>
              <td>
                <button
                  @click="editStudent(student)"
                  class="edit-btn"
                >
                  Sửa
                </button>
                <button
                  @click="confirmDelete(student._id)"
                  class="delete-btn"
                >
                  Xóa
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Modal xác nhận xóa -->
      <div v-if="showDeleteModal" class="modal">
        <div class="modal-content">
          <h3>Xác nhận xóa</h3>
          <p>Bạn có chắc muốn xóa sinh viên này?</p>
          <div class="modal-actions">
            <button @click="showDeleteModal = false" class="cancel-btn">Hủy</button>
            <button @click="deleteStudent" class="delete-btn">Xóa</button>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="error-message">
      <p>Bạn không có quyền truy cập trang này.</p>
    </div>
  </div>
</template>

<script>
import { ref } from "vue";
import { useAuthStore } from "../stores/auth"; // Sửa đường dẫn từ "../stores/auth" thành "../stores/useAuthStore"
import axios from "axios";

export default {
  setup() {
    const authStore = useAuthStore();
    const students = ref([]);
    const form = ref({
      username: "",
      name: "",
      email: "",
      password: "",
      phoneNumber: "",
      dateOfBirth: "",
      role: "student",
    });
    const editingStudent = ref(null);
    const showDeleteModal = ref(false);
    const studentIdToDelete = ref(null);

    const fetchStudents = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/students", {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        students.value = response.data;
      } catch (error) {
        console.error("Error fetching students:", error);
      }
    };

    const submitStudent = async () => {
      try {
        // Chuẩn hóa dateOfBirth trước khi gửi (nếu cần)
        const payload = { ...form.value };
        if (payload.dateOfBirth) {
          payload.dateOfBirth = new Date(payload.dateOfBirth).toISOString();
        }

        if (editingStudent.value) {
          // Sửa sinh viên
          const response = await axios.put(
            `http://localhost:5000/api/students/${editingStudent.value._id}`,
            payload,
            {
              headers: { Authorization: `Bearer ${authStore.token}` },
            }
          );
          students.value = students.value.map((s) =>
            s._id === editingStudent.value._id ? response.data.student : s
          );
          alert("sửa sinh viên thành công !")
        } else {
          // Thêm sinh viên
          const response = await axios.post("http://localhost:5000/api/students", payload, {
            headers: { Authorization: `Bearer ${authStore.token}` },
          });
          students.value.push(response.data.student);
          alert("Thêm sinh viên thành công");
        }
        resetForm();
        fetchStudents(); // Làm mới danh sách
      } catch (error) {
        console.error("Error submitting student:", error);
        alert(error.response?.data?.message || "Có lỗi xảy ra");
      }
    };

    const editStudent = (student) => {
      editingStudent.value = student;
      // Chuyển đổi dateOfBirth sang định dạng YYYY-MM-DD
      const formattedDateOfBirth = student.dateOfBirth
        ? new Date(student.dateOfBirth).toISOString().split("T")[0]
        : "";
      form.value = {
        ...student,
        password: "",
        dateOfBirth: formattedDateOfBirth, // Gán định dạng đúng cho input type="date"
      };
    };

    const cancelEdit = () => {
      resetForm();
    };

    const confirmDelete = (id) => {
      studentIdToDelete.value = id;
      showDeleteModal.value = true;
    };

    const deleteStudent = async () => {
      try {
        await axios.delete(`http://localhost:5000/api/students/${studentIdToDelete.value}`, {
          headers: { Authorization: `Bearer ${authStore.token}` },
        });
        students.value = students.value.filter((s) => s._id !== studentIdToDelete.value);
        showDeleteModal.value = false;
        setTimeout(() => {
          alert("xoá sinh viên thành công !")
        },300)
      } catch (error) {
        console.error("Error deleting student:", error);
        alert(error.response?.data?.message || "Có lỗi xảy ra");
      }
    };

    const resetForm = () => {
      form.value = {
        username: "",
        name: "",
        email: "",
        password: "",
        phoneNumber: "",
        dateOfBirth: "",
        role: "student",
      };
      editingStudent.value = null;
    };

    const formatDate = (date) => {
      if (!date) return null;
      return new Date(date).toLocaleDateString("vi-VN");
    };

    // Lấy danh sách sinh viên khi component được mount
    fetchStudents();

    return {
      authStore,
      students,
      form,
      editingStudent,
      showDeleteModal,
      submitStudent,
      editStudent,
      cancelEdit,
      confirmDelete,
      deleteStudent,
      formatDate,
    };
  },
};
</script>

<style scoped>
.student-management {
  max-width: 1200px;
  margin: 20px auto;
  padding: 20px;
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  font-family: 'Arial', sans-serif;
}

h2 {
  font-size: 24px;
  color: #333;
  margin-bottom: 20px;
  text-align: center;
}

.form-container {
  background-color: #f9f9f9;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 30px;
  box-shadow: 0 1px 5px rgba(0, 0, 0, 0.05);
}

h3 {
  font-size: 18px;
  color: #444;
  margin-bottom: 15px;
}

.student-form {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 15px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  font-size: 14px;
  color: #555;
  margin-bottom: 5px;
}

.form-group input,
.form-group select {
  padding: 10px;
  font-size: 14px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group select:focus {
  outline: none;
  border-color: #3498db;
  box-shadow: 0 0 5px rgba(52, 152, 219, 0.3);
}

.form-actions {
  grid-column: span 2;
  display: flex;
  gap: 10px;
}

.form-actions button {
  padding: 10px 20px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.form-actions button[type="submit"] {
  background-color: #3498db;
  color: #fff;
}

.form-actions button[type="submit"]:hover {
  background-color: #2980b9;
}

.form-actions .cancel-btn {
  background-color: #ccc;
  color: #333;
}

.form-actions .cancel-btn:hover {
  background-color: #bbb;
}

.table-container {
  overflow-x: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
  background-color: #fff;
}

th, td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #ddd;
}

th {
  background-color: #f4f4f4;
  font-size: 14px;
  color: #333;
  font-weight: 600;
}

tr:hover {
  background-color: #f9f9f9;
}

td {
  font-size: 14px;
  color: #444;
}

.edit-btn, .delete-btn {
  padding: 6px 12px;
  font-size: 13px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  margin-right: 5px;
  transition: background-color 0.2s;
}

.edit-btn {
  background-color: #f1c40f;
  color: #fff;
}

.edit-btn:hover {
  background-color: #d4ac0d;
}

.delete-btn {
  background-color: #e74c3c;
  color: #fff;
}

.delete-btn:hover {
  background-color: #c0392b;
}

.modal {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.modal-content {
  background-color: #fff;
  padding: 20px;
  border-radius: 8px;
  width: 400px;
  max-width: 90%;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
}

.modal-content h3 {
  font-size: 16px;
  color: #333;
  margin-bottom: 10px;
}

.modal-content p {
  font-size: 14px;
  color: #555;
  margin-bottom: 20px;
}

.modal-actions {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

.modal-actions button {
  padding: 8px 16px;
  font-size: 14px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.modal-actions .cancel-btn {
  background-color: #ccc;
  color: #333;
}

.modal-actions .cancel-btn:hover {
  background-color: #bbb;
}

.modal-actions .delete-btn {
  background-color: #e74c3c;
  color: #fff;
}

.modal-actions .delete-btn:hover {
  background-color: #c0392b;
}

.error-message {
  text-align: center;
  color: #e74c3c;
  font-size: 16px;
  margin-top: 20px;
}

@media (max-width: 768px) {
  .student-form {
    grid-template-columns: 1fr;
  }

  .form-actions {
    grid-column: span 1;
  }

  .modal-content {
    width: 90%;
  }
}
</style>