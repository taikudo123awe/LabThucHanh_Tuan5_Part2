const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    }
});

// Middleware: Tự động mã hóa mật khẩu trước khi lưu
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) {
        return next();
    }
    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (err) {
        next(err);
    }
});

// PHẦN BỔ SUNG: Thêm phương thức để so sánh mật khẩu
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        // So sánh mật khẩu người dùng nhập vào với mật khẩu đã được mã hóa trong DB
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

module.exports = mongoose.model('User', userSchema);
