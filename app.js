require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoStore = require('connect-mongo');

const authRoutes = require('./routes/authRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware để xử lý JSON
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('✅ Đã kết nối tới MongoDB!'))
    .catch(err => console.error('❌ Lỗi kết nối MongoDB:', err));

// Cấu hình Session với các tùy chọn Cookie chi tiết
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: MongoStore.create({
        mongoUrl: process.env.MONGODB_URI,
        collectionName: 'sessions'
    }),
    cookie: {
        maxAge: 24 * 60 * 60 * 1000, // 1 ngày
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    }
}));

// Routes
app.use('/api/auth', authRoutes);


module.exports = app;

if (require.main === module) {
    app.listen(PORT, () => {
        console.log(`🚀 API Server đang chạy tại http://localhost:${PORT}`);
    });
}