const roleHierarchy = {
  VT01: 3, // Admin - cao nhất
  VT02: 2, // Staff - cao nhì
  VT03: 1, // User - thấp nhất
};

exports.checkRole = (minimumRole) => {
  return (req, res, next) => {
    const userRole = req.user.maVaiTro;

    // Kiểm tra role của user có tồn tại trong hệ thống không
    if (!roleHierarchy[userRole]) {
      return res.status(403).json({
        message: "Vai trò không hợp lệ",
      });
    }

    // So sánh level của role
    if (roleHierarchy[userRole] < roleHierarchy[minimumRole]) {
      return res.status(403).json({
        message: "Bạn không có đủ quyền để thực hiện hành động này",
      });
    }

    next();
  };
};
