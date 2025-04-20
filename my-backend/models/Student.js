const mongoose = require('mongoose');

const studentSchema = new mongoose.Schema({
    username: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    email: { type: String, required: true },
    phoneNumber: { type: String },
    dateOfBirth: { type: Date },
    enrolledCourses: [String],
    role: { type: String, enum: ['student', 'admin'], default: 'student' }, // Thêm role
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Student', studentSchema);