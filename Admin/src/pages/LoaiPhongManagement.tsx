import { useEffect, useState } from 'react';
import { Table, Button, Space, Modal, Form, Input, message, Tag, Popconfirm } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons';
import { loaiPhongService } from '../services/loaiPhongService';
import { LoaiPhong } from '../types';
import useSearch from '../hooks/useSearch';
import SearchInput from '../components/SearchInput';

const LoaiPhongManagement = () => {
  const [loaiPhongs, setLoaiPhongs] = useState<LoaiPhong[]>([]);
  const [loading, setLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [editingLoaiPhong, setEditingLoaiPhong] = useState<LoaiPhong | null>(null);
  const [form] = Form.useForm();

  // Client-side search hook
  const {
    searchTerm,
    setSearchTerm,
    searchResults,
    clearSearch
  } = useSearch(loaiPhongs, {
    keys: ['tenLoaiPhong', 'moTa'],
    threshold: 0.3
  });

  useEffect(() => {
    loadLoaiPhongs();
  }, []);

  const loadLoaiPhongs = async () => {
    setLoading(true);
    try {
      const data = await loaiPhongService.getAll();
      setLoaiPhongs(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading loai phongs:', error);
      message.error('Lỗi khi tải danh sách loại phòng!');
      setLoaiPhongs([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSearch = () => {
    // Search is handled by the useSearch hook automatically
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handleAdd = () => {
    setEditingLoaiPhong(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (loaiPhong: LoaiPhong) => {
    setEditingLoaiPhong(loaiPhong);
    form.setFieldsValue(loaiPhong);
    setModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await loaiPhongService.delete(id);
      message.success('Xóa loại phòng thành công!');
      loadLoaiPhongs();
    } catch (error) {
      message.error('Lỗi khi xóa loại phòng!');
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      if (editingLoaiPhong) {
        await loaiPhongService.update({ ...values, maLoaiPhong: editingLoaiPhong.maLoaiPhong });
        message.success('Cập nhật loại phòng thành công!');
      } else {
        await loaiPhongService.create(values);
        message.success('Thêm loại phòng thành công!');
      }
      setModalVisible(false);
      loadLoaiPhongs();
    } catch (error: any) {
      message.error(error.response?.data?.message || 'Có lỗi xảy ra!');
    }
  };

  const columns = [
    {
      title: '#',
      key: 'stt',
      width: 60,
      align: 'center' as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: 'Tên loại phòng',
      dataIndex: 'tenLoaiPhong',
      key: 'tenLoaiPhong',
    },
    {
      title: 'Mô tả',
      dataIndex: 'moTa',
      key: 'moTa',
      render: (text: string) => text || 'Không có mô tả',
    },
    {
      title: 'Thao tác',
      key: 'action',
      render: (_: any, record: LoaiPhong) => (
        <Space>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa loại phòng này?"
            description="Tất cả phòng thuộc loại này sẽ bị ảnh hưởng!"
            onConfirm={() => handleDelete(record.maLoaiPhong)}
            okText="Có"
            cancelText="Không"
          >
            <Button type="link" danger icon={<DeleteOutlined />}>
              Xóa
            </Button>
          </Popconfirm>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between' }}>
        <h1>Quản lý Loại Phòng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </div>

      <SearchInput
        placeholder="Tìm kiếm loại phòng..."
        value={searchTerm}
        onChange={setSearchTerm}
        onSearch={handleSearch}
        onClear={handleClearSearch}
        loading={loading}
      />

      <Table
        columns={columns}
        dataSource={searchResults}
        rowKey="maLoaiPhong"
        loading={loading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingLoaiPhong ? 'Sửa loại phòng' : 'Thêm loại phòng'}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={600}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Tên loại phòng"
            name="tenLoaiPhong"
            rules={[{ required: true, message: 'Vui lòng nhập tên loại phòng!' }]}
          >
            <Input placeholder="Ví dụ: Phòng đơn, Phòng đôi, Phòng VIP..." />
          </Form.Item>

          <Form.Item
            label="Mô tả"
            name="moTa"
            rules={[{ required: true, message: 'Vui lòng nhập mô tả!' }]}
          >
            <Input.TextArea 
              rows={4} 
              placeholder="Mô tả chi tiết về loại phòng này..."
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default LoaiPhongManagement;
