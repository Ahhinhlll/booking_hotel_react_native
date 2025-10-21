import { useState, useEffect } from "react";
import { Layout, Menu, Avatar, Dropdown, message } from "antd";
import {
  DashboardOutlined,
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  TagOutlined,
  LogoutOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BankOutlined,
  DollarOutlined,
  StarOutlined,
  SettingOutlined,
} from "@ant-design/icons";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import { authService } from "../services/authService";

const { Header, Sider, Content } = Layout;

const MainLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [user, setUser] = useState(authService.getCurrentUser());
  const navigate = useNavigate();
  const location = useLocation();

  // Listen for storage changes to update user data
  useEffect(() => {
    const handleStorageChange = () => {
      setUser(authService.getCurrentUser());
    };

    window.addEventListener("storage", handleStorageChange);
    // Also listen for custom events from the same tab
    window.addEventListener("userUpdated", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("userUpdated", handleStorageChange);
    };
  }, []);

  const handleLogout = async () => {
    try {
      await authService.logout();
      message.success("Đăng xuất thành công!");
      // Force redirect to login page
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout error:", error);
      message.error("Đăng xuất thất bại!");
      // Even if logout fails, redirect to login
      window.location.href = "/login";
    }
  };

  const menuItems = [
    {
      key: "/",
      icon: <DashboardOutlined />,
      label: "Dashboard",
    },
    {
      key: "/users",
      icon: <UserOutlined />,
      label: "Quản lý Người dùng",
    },
    {
      key: "/hotels",
      icon: <HomeOutlined />,
      label: "Quản lý Khách sạn",
    },
    {
      key: "/rooms",
      icon: <BankOutlined />,
      label: "Quản lý Phòng",
    },
    {
      key: "/room-types",
      icon: <BankOutlined />,
      label: "Quản lý Loại Phòng",
    },
    {
      key: "/room-prices",
      icon: <DollarOutlined />,
      label: "Quản lý Giá Phòng",
    },
    {
      key: "/bookings",
      icon: <CalendarOutlined />,
      label: "Quản lý Đặt phòng",
    },
    {
      key: "/promotions",
      icon: <TagOutlined />,
      label: "Quản lý Khuyến mãi",
    },
    {
      key: "/reviews",
      icon: <StarOutlined />,
      label: "Quản lý Đánh giá",
    },
    {
      key: "/utilities",
      icon: <SettingOutlined />,
      label: "Quản lý Tiện ích",
    },
  ];

  const userMenuItems = [
    {
      key: "profile",
      icon: <UserOutlined />,
      label: "Thông tin cá nhân",
      onClick: () => navigate("/profile"),
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "Đăng xuất",
      onClick: handleLogout,
    },
  ];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider trigger={null} collapsible collapsed={collapsed}>
        <div
          style={{
            height: "64px",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            color: "white",
            fontSize: "20px",
            fontWeight: "bold",
            borderBottom: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          {collapsed ? "BH" : "Booking Hotel"}
        </div>
        <Menu
          theme="dark"
          mode="inline"
          selectedKeys={[location.pathname]}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
        />
      </Sider>
      <Layout>
        <Header
          style={{
            padding: "0 24px",
            background: "#fff",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          }}
        >
          {collapsed ? (
            <MenuUnfoldOutlined
              style={{ fontSize: "18px", cursor: "pointer" }}
              onClick={() => setCollapsed(!collapsed)}
            />
          ) : (
            <MenuFoldOutlined
              style={{ fontSize: "18px", cursor: "pointer" }}
              onClick={() => setCollapsed(!collapsed)}
            />
          )}

          <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
            <div
              style={{
                display: "flex",
                alignItems: "center",
                cursor: "pointer",
              }}
            >
              {/* Ảnh lớn hình tròn */}
              <Avatar
                src={(() => {
                  const imagePath =
                    user?.anhNguoiDung?.[1] || user?.anhNguoiDung?.[0];

                  if (!imagePath) return undefined;

                  // Construct full HTTP URL for local API
                  let fullUrl;
                  if (imagePath.startsWith("http")) {
                    fullUrl = imagePath;
                  } else if (imagePath.startsWith("/uploads/")) {
                    fullUrl = `http://localhost:3333${imagePath}`;
                  } else {
                    fullUrl = `http://localhost:3333/uploads/${imagePath}`;
                  }

                  return fullUrl;
                })()}
                icon={!user?.anhNguoiDung?.[0] ? <UserOutlined /> : undefined}
                onError={() => {
                  return false;
                }}
                style={{ width: "40px", height: "40px" }}
              />

              <span style={{ marginLeft: "8px" }}>
                {user?.hoTen || "Admin"}
              </span>
            </div>
          </Dropdown>
        </Header>
        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            minHeight: 280,
            background: "#fff",
            borderRadius: "8px",
          }}
        >
          <Outlet />
        </Content>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
