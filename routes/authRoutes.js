const express = require('express');
const User = require('../models/User');
const { isAuthenticated } = require('../middleware/authMiddleware');

const router = express.Router();

// --- ROUTE ĐĂNG KÝ (Không thay đổi) ---
router.post('/register', async (req, res) => {
    try {
        const { username, password } = req.body;
        const existingUser = await User.findOne({ username });
        if (existingUser) {
            return res.status(400).json({ message: 'Tên người dùng đã tồn tại.' });
        }
        const user = new User({ username, password });
        await user.save();
        res.status(201).json({ message: 'Đăng ký thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// --- ROUTE ĐĂNG NHẬP (Sử dụng logic SESSION) ---
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });
        if (!user) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }
        
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Tên đăng nhập hoặc mật khẩu không đúng.' });
        }
        
        // THAY ĐỔI CHÍNH: Thay vì tạo JWT, chúng ta lưu ID người dùng vào session
        req.session.userId = user._id;
        
        res.status(200).json({ message: 'Đăng nhập thành công!' });
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

// --- ROUTE ĐĂNG XUẤT (Sử dụng logic SESSION) ---
router.post('/logout', (req, res) => {
    // Hủy session trên server
    req.session.destroy(err => {
        if (err) {
            return res.status(500).json({ message: 'Không thể đăng xuất, vui lòng thử lại.' });
        }
        // Yêu cầu trình duyệt xóa cookie session
        // 'connect.sid' là tên cookie mặc định của express-session
        res.clearCookie('connect.sid'); 
        res.status(200).json({ message: 'Đăng xuất thành công!' });
    });
});

// --- ROUTE PROFILE (Sử dụng logic SESSION) ---
router.get('/profile', isAuthenticated, async (req, res) => {
    try {
        // Middleware `isAuthenticated` đã kiểm tra session
        // ID người dùng được lấy từ session thay vì từ token
        const user = await User.findById(req.session.userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'Không tìm thấy người dùng.' });
        }
        res.json(user);
    } catch (error) {
        res.status(500).json({ message: 'Lỗi server', error: error.message });
    }
});

module.exports = router;

