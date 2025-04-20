<template>
  <div class="comment-item" :style="{ marginLeft: level * 20 + 'px' }">
    <p class="comment-author">{{ comment.createdBy?.username || "Ẩn danh" }}</p>
    <p v-if="comment.content" class="comment-content">{{ comment.content }}</p>
    <img
      v-if="imageSrc"
      :src="imageSrc"
      alt="Comment Image"
      class="comment-image"
    />
    <p class="comment-date">{{ formatDate(comment.createdAt) }}</p>
    <button class="btn-reply" @click="handleReply">Trả lời</button>
    <div v-if="comment.children && comment.children.length" class="comment-children">
      <comment-item
        v-for="child in comment.children"
        :key="child._id"
        :comment="child"
        :level="level + 1"
        @reply="$emit('reply', $event)"
      />
    </div>
  </div>
</template>

<script>
export default {
  name: "CommentItem",
  props: {
    comment: Object,
    level: Number,
  },
  emits: ["reply"],
  computed: {
    imageSrc() {
      if (this.comment.imageBase64) {
        return `data:image/jpeg;base64,${this.comment.imageBase64}`;
      }
      if (this.comment.image) {
        // Xử lý trường hợp image là Base64 thô
        return `data:image/jpeg;base64,${this.comment.image}`;
      }
      return null;
    },
  },
  methods: {
    formatDate(date) {
      return new Date(date).toLocaleDateString("vi-VN", {
        year: "numeric",
        month: "long",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    },
    handleReply() {
      console.log("Rendering comment:", this.comment);
      this.$emit("reply", this.comment);
    },
  },
};
</script>

<style scoped>
.comment-item {
  background: #f9f9f9;
  padding: 15px;
  border-radius: 5px;
  border-left: 4px solid #3498db;
  transition: transform 0.2s;
}

.comment-item:hover {
  transform: translateY(-3px);
}

.comment-author {
  font-weight: bold;
  color: #2c3e50;
  margin-bottom: 5px;
}

.comment-content {
  color: #333;
  margin-bottom: 5px;
}

.comment-image {
  max-width: 300px;
  max-height: 300px;
  object-fit: cover;
  border-radius: 5px;
  margin-bottom: 10px;
}

.comment-date {
  font-size: 0.85em;
  color: #7f8c8d;
}

.btn-reply {
  background: none;
  border: none;
  color: #3498db;
  cursor: pointer;
  font-size: 0.9em;
  padding: 0;
  margin-top: 5px;
}

.btn-reply:hover {
  text-decoration: underline;
}

.comment-children {
  margin-top: 10px;
}
</style>