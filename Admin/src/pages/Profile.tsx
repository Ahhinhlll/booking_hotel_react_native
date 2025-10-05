import { useState, useEffect } from 'react';
import { Card, Form, Input, Button, message, Avatar, Tabs, Row, Col, Divider, Select } from 'antd';
import { UserOutlined, LockOutlined, SaveOutlined } from '@ant-design/icons';
import { nguoiDungService } from '../services/nguoiDungService';
import { authService } from '../services/authService';
import { uploadService } from '../services/uploadService';
import ImageUpload from '../components/ImageUpload';
import { NguoiDung } from '../types';

const Profile = () => {
  const [user, setUser] = useState<NguoiDung | null>(null);
  const [loading, setLoading] = useState(false);
  const [form] = Form.useForm();
  const [passwordForm] = Form.useForm();

  useEffect(() => {
    loadUserProfile();
  }, []);

  const loadUserProfile = async () => {
    const currentUser = authService.getCurrentUser();
    if (!currentUser) return;

    try {
      const userData = await nguoiDungService.getById(currentUser.maNguoiDung);
      setUser(userData);
      form.setFieldsValue(userData);
    } catch (error) {
      message.error('Lỗi khi tải thông tin người dùng!');
    }
  };

  const handleUpdateProfile = async (values: any) => {
    if (!user) return;

    setLoading(true);
    try {
      await nguoiDungService.update({
        ...values,
        maNguoiDung: user.maNguoiDung,
      });

      // Cập nhật localStorage
      const updatedUser = { ...user, ...values };
      localStorage.setItem('user', JSON.stringify(updatedUser));
      setUser(updatedUser);

      message.success('Cập nhật thông tin thành công!');
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Cập nhật thất bại!');
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async (values: any) => {
    if (!user) return;

    setLoading(true);
    try {
      await nguoiDungService.updatePassword({
        maNguoiDung: user.maNguoiDung,
        matKhauCu: values.currentPassword,
        matKhauMoi: values.newPassword,
      });

      message.success('Đổi mật khẩu thành công!');
      passwordForm.resetFields();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Đổi mật khẩu thất bại!');
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <Card loading={true}>
        <div style={{ textAlign: 'center', padding: '50px' }}>
          Đang tải thông tin...
        </div>
      </Card>
    );
  }

  const tabItems = [
    {
      key: '1',
      label: (
        <span>
          <UserOutlined /> Thông tin cá nhân
        </span>
      ),
      children: (
        <Form
          form={form}
          layout="vertical"
          onFinish={handleUpdateProfile}
          initialValues={user}
        >
          <Row gutter={24}>
            <Col span={24} style={{ textAlign: 'center', marginBottom: 24 }}>
              <Avatar
                size={120}
                src={user.anhNguoiDung?.[0] ? uploadService.getImageUrl(user.anhNguoiDung[0]) : undefined}
                icon={!user.anhNguoiDung?.[0] ? <UserOutlined /> : undefined}
                style={{ marginBottom: 16 }}
              />
              <Form.Item name="anhNguoiDung" style={{ marginTop: 16 }}>
                <ImageUpload maxCount={1} />
              </Form.Item>
            </Col>
          </Row>

          <Divider>Thông tin cơ bản</Divider>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Họ tên"
                name="hoTen"
                rules={[{ required: true, message: 'Vui lòng nhập họ tên!' }]}
              >
                <Input size="large" prefix={<UserOutlined />} />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Email"
                name="email"
                rules={[
                  { required: true, message: 'Vui lòng nhập email!' },
                  { type: 'email', message: 'Email không hợp lệ!' }
                ]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                label="Số điện thoại"
                name="sdt"
                rules={[{ required: true, message: 'Vui lòng nhập số điện thoại!' }]}
              >
                <Input size="large" />
              </Form.Item>
            </Col>

            <Col span={12}>
              <Form.Item
                label="Vai trò"
                name="maVaiTro"
              >
                <Select size="large" disabled>
                  <Select.Option value="VT01">Admin</Select.Option>
                  <Select.Option value="VT02">Nhân viên</Select.Option>
                  <Select.Option value="VT03">Khách hàng</Select.Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Form.Item
            label="Địa chỉ"
            name="diaChi"
          >
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              block
            >
              Lưu thay đổi
            </Button>
          </Form.Item>
        </Form>
      ),
    },
    {
      key: '2',
      label: (
        <span>
          <LockOutlined /> Đổi mật khẩu
        </span>
      ),
      children: (
        <Form
          form={passwordForm}
          layout="vertical"
          onFinish={handleChangePassword}
        >
          <Form.Item
            label="Mật khẩu hiện tại"
            name="currentPassword"
            rules={[{ required: true, message: 'Vui lòng nhập mật khẩu hiện tại!' }]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Mật khẩu mới"
            name="newPassword"
            rules={[
              { required: true, message: 'Vui lòng nhập mật khẩu mới!' },
              { min: 6, message: 'Mật khẩu phải có ít nhất 6 ký tự!' },
            ]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item
            label="Xác nhận mật khẩu mới"
            name="confirmPassword"
            dependencies={['newPassword']}
            rules={[
              { required: true, message: 'Vui lòng xác nhận mật khẩu mới!' },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue('newPassword') === value) {
                    return Promise.resolve();
                  }
                  return Promise.reject(new Error('Mật khẩu xác nhận không khớp!'));
                },
              }),
            ]}
          >
            <Input.Password size="large" prefix={<LockOutlined />} />
          </Form.Item>

          <Form.Item>
            <Button
              type="primary"
              htmlType="submit"
              loading={loading}
              icon={<SaveOutlined />}
              size="large"
              block
            >
              Đổi mật khẩu
            </Button>
          </Form.Item>
        </Form>
      ),
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: 24 }}>Thông tin cá nhân</h1>
      
      <Card>
        <Tabs items={tabItems} />
      </Card>
    </div>
  );
};

export default Profile;

