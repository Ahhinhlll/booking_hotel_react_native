import { useState } from "react";
import { Form, Input, Button, Card, message } from "antd";
import { UserOutlined, LockOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router-dom";
import { authService } from "../services/authService";
import { LoginRequest } from "../types";

interface ErrorResponse {
  response?: {
    data?: {
      message?: string;
    };
  };
}

const Login = () => {
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onFinish = async (values: LoginRequest) => {
    setLoading(true);
    try {
      // Backend expects 'identifier' instead of 'email'
      // Chuyển đổi giá trị từ form sang đúng định dạng mà backend yêu cầu
      const loginPayload = {
        identifier: values.email,
        matKhau: values.matKhau,
      };

      // Ép kiểu payload để phù hợp với định nghĩa của authService.login
      const response = await authService.login(loginPayload as any);

      // Kiểm tra xem user có phải là Admin không (maVaiTro: VT01)
      if (response.user.maVaiTro !== "VT01") {
        message.error("Bạn không có quyền truy cập vào trang quản trị!");
        return;
      }

      localStorage.setItem("accessToken", response.accessToken);
      localStorage.setItem("refreshToken", response.refreshToken);
      localStorage.setItem("user", JSON.stringify(response.user));

      message.success("Đăng nhập thành công!");
      navigate("/");
    } catch (error: unknown) {
      const errorMessage =
        (error as ErrorResponse)?.response?.data?.message ||
        "Đăng nhập thất bại!";
      message.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "100vh",
        backgroundImage:
          "url('https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1920&q=80')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        position: "relative",
      }}
    >
      {/* Overlay để làm tối hình nền */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: "rgba(0, 0, 0, 0.6)",
        }}
      ></div>

      <div
        style={{
          position: "relative",
          width: "100%",
          maxWidth: "450px",
          padding: "0 20px",
        }}
      >
        <Card
          title={
            <div
              style={{
                textAlign: "center",
                fontSize: "28px",
                fontWeight: "bold",
                color: "#1890ff",
                marginBottom: "24px",
              }}
            >
              <div>Quản Trị Hệ Thống</div>
            </div>
          }
          style={{
            borderRadius: "12px",
            boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
            border: "none",
            overflow: "hidden",
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
          bodyStyle={{ padding: "32px" }}
        >
          <Form
            name="login"
            onFinish={onFinish}
            autoComplete="off"
            layout="vertical"
          >
            <Form.Item
              label="Email"
              name="email"
              rules={[
                { required: true, message: "Vui lòng nhập email!" },
                { type: "email", message: "Email không hợp lệ!" },
              ]}
            >
              <Input
                prefix={<UserOutlined style={{ color: "#1890ff" }} />}
                placeholder="Nhập địa chỉ email"
                size="large"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item
              label="Mật khẩu"
              name="matKhau"
              rules={[{ required: true, message: "Vui lòng nhập mật khẩu!" }]}
            >
              <Input.Password
                prefix={<LockOutlined style={{ color: "#1890ff" }} />}
                placeholder="Nhập mật khẩu"
                size="large"
                style={{ borderRadius: "8px" }}
              />
            </Form.Item>

            <Form.Item>
              <Button
                type="primary"
                htmlType="submit"
                loading={loading}
                block
                size="large"
                style={{
                  height: "48px",
                  fontSize: "16px",
                  borderRadius: "8px",
                  backgroundColor: "#1890ff",
                  borderColor: "#1890ff",
                }}
              >
                Đăng nhập
              </Button>
            </Form.Item>

            <div
              style={{ textAlign: "center", marginTop: "16px", color: "#888" }}
            >
              <small>Hệ thống quản lý đặt phòng khách sạn chuyên nghiệp</small>
            </div>
          </Form>
        </Card>
      </div>
    </div>
  );
};

export default Login;
