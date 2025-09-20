// Middleware để kiểm tra xác thực người dùng
exports.isAuthenticated = (req, res, next) => {
    // Kiểm tra xem req.session.userId có tồn tại hay không
    // req.session.userId được tạo ra khi người dùng đăng nhập thành công
    if (req.session && req.session.userId) {
        // Nếu có, người dùng đã được xác thực -> cho phép đi tiếp
        return next(); 
    }
    
    // Nếu không có, trả về lỗi 401 Unauthorized
    res.status(401).json({ message: 'Unauthorized: Vui lòng đăng nhập.' });
};