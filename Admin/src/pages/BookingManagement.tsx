import { useEffect, useState } from "react";
import {
  Table,
  Button,
  Space,
  Modal,
  Form,
  Input,
  Select,
  message,
  Tag,
  Popconfirm,
  DatePicker,
  InputNumber,
  Tabs,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  EyeOutlined,
  BankOutlined,
  HomeOutlined,
  UserOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileTextOutlined,
  PictureOutlined,
  CheckCircleOutlined,
  HistoryOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  MailOutlined,
} from "@ant-design/icons";
import { datPhongService } from "../services/datPhongService";
import { nguoiDungService } from "../services/nguoiDungService";
import { khachSanService } from "../services/khachSanService";
import { phongService } from "../services/phongService";
import { DatPhong, NguoiDung, KhachSan, Phong } from "../types";
import dayjs from "dayjs";
import ImageDisplay from "../components/ImageDisplay";
import useSearch from "../hooks/useSearch";
import SearchInput from "../components/SearchInput";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const { RangePicker } = DatePicker;

const BookingManagement = () => {
  const [bookings, setBookings] = useState<DatPhong[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [users, setUsers] = useState<NguoiDung[]>([]);
  const [hotels, setHotels] = useState<KhachSan[]>([]);
  const [rooms, setRooms] = useState<Phong[]>([]);
  const [loading, setLoading] = useState(false);
  const [completedLoading, setCompletedLoading] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [detailModalVisible, setDetailModalVisible] = useState(false);
  const [editingBooking, setEditingBooking] = useState<DatPhong | null>(null);
  const [selectedBooking, setSelectedBooking] = useState<DatPhong | null>(null);
  const [form] = Form.useForm();
  const [availabilityModalVisible, setAvailabilityModalVisible] =
    useState(false);
  const [availabilityResult, setAvailabilityResult] = useState<{
    available: boolean;
    message: string;
  } | null>(null);

  // Client-side search hook
  const { searchTerm, setSearchTerm, searchResults, clearSearch } = useSearch(
    bookings,
    {
      keys: ["maDatPhong", "trangThai"],
      threshold: 0.3,
    }
  );

  useEffect(() => {
    loadBookings();
    loadCompletedBookings();
    loadUsers();
    loadHotels();
    loadRooms();
  }, []);

  const loadBookings = async () => {
    setLoading(true);
    try {
      const data = await datPhongService.getAll();
      // Ensure data is always an array
      setBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading bookings:", error);
      message.error("Lỗi khi tải danh sách đặt phòng!");
      setBookings([]); // Set empty array on error
    } finally {
      setLoading(false);
    }
  };

  const loadCompletedBookings = async () => {
    setCompletedLoading(true);
    try {
      const data = await datPhongService.getCompletedBookings();
      setCompletedBookings(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading completed bookings:", error);
      message.error("Lỗi khi tải danh sách đặt phòng hoàn thành!");
      setCompletedBookings([]);
    } finally {
      setCompletedLoading(false);
    }
  };

  const loadUsers = async () => {
    try {
      const data = await nguoiDungService.getAll();
      const usersData = Array.isArray(data) ? data : [];
      setUsers(usersData.filter((u) => u.maVaiTro === "VT03")); // Chỉ lấy khách hàng
    } catch (error) {
      console.error("Error loading users:", error);
      setUsers([]);
    }
  };

  const loadHotels = async () => {
    try {
      const data = await khachSanService.getAll();
      setHotels(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading hotels:", error);
      setHotels([]);
    }
  };

  const loadRooms = async () => {
    try {
      const data = await phongService.getAll();
      setRooms(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Error loading rooms:", error);
      setRooms([]);
    }
  };

  const handleAdd = () => {
    setEditingBooking(null);
    form.resetFields();
    setModalVisible(true);
  };

  const handleEdit = (booking: DatPhong) => {
    setEditingBooking(booking);
    form.setFieldsValue({
      ...booking,
      dateRange: [dayjs(booking.ngayNhan), dayjs(booking.ngayTra)],
    });
    setModalVisible(true);
  };

  const handleViewDetail = (booking: DatPhong) => {
    setSelectedBooking(booking);
    setDetailModalVisible(true);
  };

  const handleDelete = async (id: string) => {
    try {
      await datPhongService.delete(id);
      message.success("Xóa đặt phòng thành công!");
      loadBookings();
    } catch (error) {
      message.error("Lỗi khi xóa đặt phòng!");
    }
  };

  const handleStatusUpdate = async (id: string, newStatus: string) => {
    try {
      await datPhongService.updateStatus(id, newStatus);
      message.success("Cập nhật trạng thái thành công!");
      loadBookings();
      // Nếu status là "Hoàn thành", reload completed bookings
      if (newStatus === "Hoàn thành") {
        loadCompletedBookings();
      }
    } catch (error) {
      message.error("Lỗi khi cập nhật trạng thái!");
    }
  };

  const handleSearch = () => {
    // Search is handled by the useSearch hook automatically
  };

  const handleClearSearch = () => {
    clearSearch();
  };

  const handleCheckAvailability = async (values: any) => {
    try {
      const result = await datPhongService.checkAvailability({
        roomId: values.maPhong,
        checkInDateTime: values.dateRange[0].format("YYYY-MM-DD"),
        checkOutDateTime: values.dateRange[1].format("YYYY-MM-DD"),
      });
      setAvailabilityResult(result);
      setAvailabilityModalVisible(true);
    } catch (error) {
      message.error("Lỗi khi kiểm tra tính khả dụng!");
    }
  };

  const handleSubmit = async (values: any) => {
    try {
      const submitData = {
        ...values,
        ngayNhan: values.dateRange[0].format("YYYY-MM-DD"),
        ngayTra: values.dateRange[1].format("YYYY-MM-DD"),
        dateRange: undefined,
      };
      delete submitData.dateRange;

      if (editingBooking) {
        await datPhongService.update({
          ...submitData,
          maDatPhong: editingBooking.maDatPhong,
        });
        message.success("Cập nhật đặt phòng thành công!");
      } else {
        await datPhongService.create(submitData);
        message.success("Thêm đặt phòng thành công!");
      }
      setModalVisible(false);
      loadBookings();
    } catch (error: any) {
      message.error(error.response?.data?.message || "Có lỗi xảy ra!");
    }
  };

  // Xuất Excel cho đơn hoàn thành
  const handleExportExcel = () => {
    if (completedBookings.length === 0) {
      message.warning("Không có dữ liệu để xuất!");
      return;
    }

    const exportData = completedBookings.map((booking, index) => ({
      "STT": index + 1,
      "Khách hàng": booking.tenNguoiDat || "N/A",
      "Email": booking.emailNguoiDat || "N/A",
      "SĐT": booking.sdtNguoiDat || "N/A",
      "Khách sạn": booking.tenKS || "N/A",
      "Phòng": booking.tenPhong || "N/A",
      "Loại đặt": booking.loaiDat || "N/A",
      "Ngày đặt": dayjs(booking.ngayDat).format("DD/MM/YYYY HH:mm"),
      "Ngày nhận": dayjs(booking.ngayNhan).format("DD/MM/YYYY HH:mm"),
      "Ngày trả": dayjs(booking.ngayTra).format("DD/MM/YYYY HH:mm"),
      "Tổng tiền gốc": booking.tongTienGoc?.toLocaleString() + " VNĐ",
      "Tổng tiền sau giảm": booking.tongTienSauGiam?.toLocaleString() + " VNĐ",
      "Trạng thái": booking.trangThai || "N/A",
      "Ngày hoàn thành": dayjs(booking.completedAt).format("DD/MM/YYYY HH:mm"),
      "Đã đánh giá": booking.hasReviewed ? "Có" : "Chưa",
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Đơn hoàn thành");

    const colWidths = Object.keys(exportData[0] || {}).map((key) => ({
      wch: Math.max(key.length, 20),
    }));
    worksheet["!cols"] = colWidths;

    const excelBuffer = XLSX.write(workbook, { bookType: "xlsx", type: "array" });
    const data = new Blob([excelBuffer], { type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" });
    saveAs(data, `DonDatPhongHoanThanh_${dayjs().format("DDMMYYYY_HHmmss")}.xlsx`);
    message.success("Xuất Excel thành công!");
  };

  // In danh sách đơn hoàn thành
  const handlePrint = () => {
    if (completedBookings.length === 0) {
      message.warning("Không có dữ liệu để in!");
      return;
    }

    const printContent = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Danh sách đơn đặt phòng hoàn thành</title>
        <style>
          body { font-family: Arial, sans-serif; padding: 20px; }
          h1 { text-align: center; color: #1890ff; }
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 11px; }
          th, td { border: 1px solid #ddd; padding: 6px; text-align: left; }
          th { background-color: #1890ff; color: white; }
          tr:nth-child(even) { background-color: #f2f2f2; }
          .print-date { text-align: right; color: #666; margin-bottom: 20px; }
        </style>
      </head>
      <body>
        <h1>DANH SÁCH ĐƠN ĐẶT PHÒNG HOÀN THÀNH</h1>
        <p class="print-date">Ngày in: ${dayjs().format("DD/MM/YYYY HH:mm")}</p>
        <table>
          <thead>
            <tr>
              <th>STT</th>
              <th>Khách hàng</th>
              <th>Khách sạn</th>
              <th>Phòng</th>
              <th>Loại đặt</th>
              <th>Ngày nhận</th>
              <th>Ngày trả</th>
              <th>Tổng tiền</th>
              <th>Hoàn thành</th>
              <th>Đánh giá</th>
            </tr>
          </thead>
          <tbody>
            ${completedBookings.map((booking, index) => `
              <tr>
                <td>${index + 1}</td>
                <td>${booking.tenNguoiDat || "N/A"}</td>
                <td>${booking.tenKS || "N/A"}</td>
                <td>${booking.tenPhong || "N/A"}</td>
                <td>${booking.loaiDat || "N/A"}</td>
                <td>${dayjs(booking.ngayNhan).format("DD/MM/YYYY")}</td>
                <td>${dayjs(booking.ngayTra).format("DD/MM/YYYY")}</td>
                <td>${booking.tongTienSauGiam?.toLocaleString() || 0} VNĐ</td>
                <td>${dayjs(booking.completedAt).format("DD/MM/YYYY HH:mm")}</td>
                <td>${booking.hasReviewed ? "Đã đánh giá" : "Chưa"}</td>
              </tr>
            `).join("")}
          </tbody>
        </table>
        <p style="text-align: center; margin-top: 30px; color: #666;">
          Tổng: ${completedBookings.length} đơn | 
          Tổng doanh thu: ${completedBookings.reduce((sum, b) => sum + (b.tongTienSauGiam || 0), 0).toLocaleString()} VNĐ
        </p>
      </body>
      </html>
    `;

    const printWindow = window.open("", "_blank");
    if (printWindow) {
      printWindow.document.write(printContent);
      printWindow.document.close();
      printWindow.print();
    }
  };

  // Gửi email báo cáo
  const handleSendEmail = async () => {
    if (completedBookings.length === 0) {
      message.warning("Không có dữ liệu để gửi!");
      return;
    }

    try {
      message.loading({ content: "Đang gửi email báo cáo...", key: "sendEmail" });
      
      const result = await datPhongService.sendCompletedBookingsReportEmail();
      
      if (result.success) {
        message.success({
          content: `Đã gửi báo cáo ${result.data?.bookingsCount} đơn hoàn thành đến ${result.data?.sentTo}`,
          key: "sendEmail",
          duration: 5,
        });
      } else {
        message.error({
          content: result.message || "Lỗi khi gửi email báo cáo",
          key: "sendEmail",
        });
      }
    } catch (error: any) {
      message.error({
        content: error.response?.data?.message || "Lỗi khi gửi email báo cáo",
        key: "sendEmail",
      });
    }
  };

  const columns = [
    {
      title: "#",
      key: "stt",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Khách hàng",
      dataIndex: "NguoiDung",
      key: "customer",
      render: (nguoiDung: any) => nguoiDung?.hoTen || "N/A",
    },
    {
      title: "Khách sạn",
      dataIndex: "KhachSan",
      key: "hotel",
      render: (khachSan: any) => khachSan?.tenKS || "N/A",
    },
    {
      title: "Phòng",
      dataIndex: "Phong",
      key: "room",
      render: (phong: any) => phong?.tenPhong || "N/A",
    },
    {
      title: "Loại đặt",
      dataIndex: "loaiDat",
      key: "loaiDat",
      render: (type: string) => {
        const color =
          type === "Theo giờ"
            ? "blue"
            : type === "Qua đêm"
            ? "green"
            : "orange";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Ngày nhận",
      dataIndex: "ngayNhan",
      key: "ngayNhan",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày trả",
      dataIndex: "ngayTra",
      key: "ngayTra",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTienSauGiam",
      key: "tongTienSauGiam",
      render: (amount: number) => `${amount?.toLocaleString() || 0} VNĐ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (status: string, record: DatPhong) => {
        return (
          <Select
            value={status}
            style={{ width: 150 }}
            onChange={(newStatus) =>
              handleStatusUpdate(record.maDatPhong, newStatus)
            }
          >
            <Select.Option value="Chờ xác nhận thanh toán">
              Chờ xác nhận thanh toán
            </Select.Option>
            <Select.Option value="Đã xác nhận">Đã xác nhận</Select.Option>
            <Select.Option value="Đã hủy">Đã hủy</Select.Option>
            <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
          </Select>
        );
      },
    },
    {
      title: "Thao tác",
      key: "action",
      render: (_: any, record: DatPhong) => (
        <Space>
          <Button
            type="link"
            icon={<EyeOutlined />}
            onClick={() => handleViewDetail(record)}
          >
            Chi tiết
          </Button>
          <Button
            type="link"
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Sửa
          </Button>
          <Popconfirm
            title="Bạn có chắc muốn xóa đặt phòng này?"
            onConfirm={() => handleDelete(record.maDatPhong)}
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

  const completedColumns = [
    {
      title: "#",
      key: "stt",
      width: 60,
      align: "center" as const,
      render: (_: any, __: any, index: number) => index + 1,
    },
    {
      title: "Khách hàng",
      dataIndex: "tenNguoiDat",
      key: "customer",
      render: (name: string) => name || "N/A",
    },
    {
      title: "Khách sạn",
      dataIndex: "tenKS",
      key: "hotel",
      render: (name: string) => name || "N/A",
    },
    {
      title: "Phòng",
      dataIndex: "tenPhong",
      key: "room",
      render: (name: string) => name || "N/A",
    },
    {
      title: "Loại đặt",
      dataIndex: "loaiDat",
      key: "loaiDat",
      render: (type: string) => {
        const color =
          type === "Theo giờ"
            ? "blue"
            : type === "Qua đêm"
            ? "green"
            : "orange";
        return <Tag color={color}>{type}</Tag>;
      },
    },
    {
      title: "Ngày nhận",
      dataIndex: "ngayNhan",
      key: "ngayNhan",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Ngày trả",
      dataIndex: "ngayTra",
      key: "ngayTra",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTienSauGiam",
      key: "tongTienSauGiam",
      render: (amount: number) => `${amount?.toLocaleString() || 0} VNĐ`,
    },
    {
      title: "Ngày hoàn thành",
      dataIndex: "completedAt",
      key: "completedAt",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Đã đánh giá",
      dataIndex: "hasReviewed",
      key: "hasReviewed",
      render: (hasReviewed: boolean) => (
        <Tag color={hasReviewed ? "green" : "orange"}>
          {hasReviewed ? "Đã đánh giá" : "Chưa đánh giá"}
        </Tag>
      ),
    },
  ];

  return (
    <div>
      <div
        style={{
          marginBottom: 16,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <h1>Quản lý Đặt phòng</h1>
        <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
          Thêm mới
        </Button>
      </div>

      <Tabs
        defaultActiveKey="active"
        items={[
          {
            key: "active",
            label: (
              <span>
                <CheckCircleOutlined />
                Đặt phòng đang hoạt động
              </span>
            ),
            children: (
              <div>
                <SearchInput
                  placeholder="Tìm kiếm đặt phòng..."
                  value={searchTerm}
                  onChange={setSearchTerm}
                  onSearch={handleSearch}
                  onClear={handleClearSearch}
                  loading={loading}
                />
                <Table
                  columns={columns}
                  dataSource={searchResults}
                  rowKey="maDatPhong"
                  loading={loading}
                  pagination={{ pageSize: 10 }}
                  scroll={{ x: 1200 }}
                />
              </div>
            ),
          },
          {
            key: "completed",
            label: (
              <span>
                <HistoryOutlined />
                Đặt phòng đã hoàn thành
              </span>
            ),
            children: (
              <div>
                <Space style={{ marginBottom: 16 }}>
                  <Button
                    type="primary"
                    icon={<FileExcelOutlined />}
                    onClick={handleExportExcel}
                    style={{ backgroundColor: "#52c41a", borderColor: "#52c41a" }}
                  >
                    Xuất Excel
                  </Button>
                  <Button
                    icon={<PrinterOutlined />}
                    onClick={handlePrint}
                  >
                    In danh sách
                  </Button>
                  <Button
                    icon={<MailOutlined />}
                    onClick={handleSendEmail}
                  >
                    Gửi Email
                  </Button>
                </Space>
                <Table
                  columns={completedColumns}
                  dataSource={completedBookings}
                  rowKey="maDP"
                  loading={completedLoading}
                  pagination={{ pageSize: 10, showSizeChanger: false }}
                  scroll={{ x: 1200 }}
                />
              </div>
            ),
          },
        ]}
      />

      <Modal
        title={editingBooking ? "Sửa đặt phòng" : "Thêm đặt phòng"}
        open={modalVisible}
        onCancel={() => setModalVisible(false)}
        onOk={() => form.submit()}
        width={700}
        footer={[
          <Button
            key="check"
            onClick={() => form.validateFields().then(handleCheckAvailability)}
          >
            Kiểm tra khả dụng
          </Button>,
          <Button key="cancel" onClick={() => setModalVisible(false)}>
            Hủy
          </Button>,
          <Button key="submit" type="primary" onClick={() => form.submit()}>
            {editingBooking ? "Cập nhật" : "Thêm mới"}
          </Button>,
        ]}
      >
        <Form form={form} layout="vertical" onFinish={handleSubmit}>
          <Form.Item
            label="Khách hàng"
            name="maND"
            rules={[{ required: true, message: "Vui lòng chọn khách hàng!" }]}
          >
            <Select showSearch optionFilterProp="children">
              {users.map((user) => (
                <Select.Option key={user.maNguoiDung} value={user.maNguoiDung}>
                  {user.hoTen} - {user.email}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Khách sạn"
            name="maKS"
            rules={[{ required: true, message: "Vui lòng chọn khách sạn!" }]}
          >
            <Select showSearch optionFilterProp="children">
              {hotels.map((hotel) => (
                <Select.Option key={hotel.maKS} value={hotel.maKS}>
                  {hotel.tenKS}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Phòng"
            name="maPhong"
            rules={[{ required: true, message: "Vui lòng chọn phòng!" }]}
          >
            <Select showSearch optionFilterProp="children">
              {rooms.map((room) => (
                <Select.Option key={room.maPhong} value={room.maPhong}>
                  {room.tenPhong} - {room.KhachSan?.tenKS}
                </Select.Option>
              ))}
            </Select>
          </Form.Item>

          <Form.Item
            label="Loại đặt phòng"
            name="loaiDat"
            rules={[
              { required: true, message: "Vui lòng chọn loại đặt phòng!" },
            ]}
          >
            <Select>
              <Select.Option value="Theo giờ">Theo giờ</Select.Option>
              <Select.Option value="Qua đêm">Qua đêm</Select.Option>
              <Select.Option value="Theo ngày">Theo ngày</Select.Option>
            </Select>
          </Form.Item>

          <Form.Item
            label="Ngày nhận - Ngày trả"
            name="dateRange"
            rules={[{ required: true, message: "Vui lòng chọn ngày!" }]}
          >
            <RangePicker style={{ width: "100%" }} format="DD/MM/YYYY" />
          </Form.Item>

          <Form.Item
            label="Số người lớn"
            name="soNguoiLon"
            rules={[{ required: true, message: "Vui lòng nhập số người lớn!" }]}
          >
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Số trẻ em" name="soTreEm" initialValue={0}>
            <InputNumber min={0} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Số giờ (nếu đặt theo giờ)" name="soGio">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item label="Số ngày (nếu đặt theo ngày)" name="soNgay">
            <InputNumber min={1} style={{ width: "100%" }} />
          </Form.Item>

          <Form.Item
            label="Tổng tiền gốc"
            name="tongTienGoc"
            rules={[
              { required: true, message: "Vui lòng nhập tổng tiền gốc!" },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) =>
                parseFloat(value!.replace(/\$\s?|(,*)/g, "")) || (0 as any)
              }
            />
          </Form.Item>

          <Form.Item
            label="Tổng tiền sau giảm"
            name="tongTienSauGiam"
            rules={[
              { required: true, message: "Vui lòng nhập tổng tiền sau giảm!" },
            ]}
          >
            <InputNumber
              min={0}
              style={{ width: "100%" }}
              formatter={(value) =>
                `${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ",")
              }
              parser={(value) =>
                parseFloat(value!.replace(/\$\s?|(,*)/g, "")) || (0 as any)
              }
            />
          </Form.Item>

          <Form.Item label="Ghi chú" name="ghiChu">
            <Input.TextArea rows={3} />
          </Form.Item>

          <Form.Item
            label="Trạng thái"
            name="trangThai"
            rules={[{ required: true, message: "Vui lòng chọn trạng thái!" }]}
          >
            <Select>
              <Select.Option value="Chờ xác nhận thanh toán">
                Chờ xác nhận thanh toán
              </Select.Option>
              <Select.Option value="Đã xác nhận">Đã xác nhận</Select.Option>
              <Select.Option value="Đã hủy">Đã hủy</Select.Option>
              <Select.Option value="Hoàn thành">Hoàn thành</Select.Option>
            </Select>
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title={
          <div
            style={{ fontSize: "18px", fontWeight: "bold", color: "#1890ff" }}
          >
            <FileTextOutlined style={{ marginRight: "8px" }} />
            Chi tiết đặt phòng
          </div>
        }
        open={detailModalVisible}
        onCancel={() => setDetailModalVisible(false)}
        footer={[
          <Button
            key="close"
            type="primary"
            onClick={() => setDetailModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
        width={800}
      >
        {selectedBooking && (
          <div style={{ padding: "20px 0" }}>
            {/* Header Section */}
            <div
              style={{
                background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
                color: "white",
                padding: "20px",
                borderRadius: "8px",
                marginBottom: "24px",
                textAlign: "center",
              }}
            >
              <h2 style={{ margin: 0, fontSize: "24px" }}>
                <BankOutlined style={{ marginRight: "8px" }} />
                {selectedBooking.KhachSan?.tenKS}
              </h2>
              <p
                style={{ margin: "8px 0 0 0", fontSize: "16px", opacity: 0.9 }}
              >
                Mã đặt phòng: <strong>{selectedBooking.maDatPhong}</strong>
              </p>
            </div>

            {/* Images Section */}
            <div style={{ marginBottom: "24px" }}>
              <h3
                style={{
                  color: "#1890ff",
                  borderBottom: "2px solid #1890ff",
                  paddingBottom: "8px",
                  marginBottom: "16px",
                  fontSize: "16px",
                }}
              >
                <PictureOutlined style={{ marginRight: "8px" }} />
                Hình ảnh
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "20px",
                  background: "#f8f9fa",
                  padding: "20px",
                  borderRadius: "8px",
                }}
              >
                <div style={{ textAlign: "center" }}>
                  <h4 style={{ marginBottom: "12px", color: "#1890ff" }}>
                    <BankOutlined style={{ marginRight: "8px" }} />
                    Khách sạn
                  </h4>
                  <ImageDisplay
                    images={selectedBooking.KhachSan?.anh || []}
                    width={200}
                    height={150}
                  />
                </div>
                <div style={{ textAlign: "center" }}>
                  <h4 style={{ marginBottom: "12px", color: "#52c41a" }}>
                    <HomeOutlined style={{ marginRight: "8px" }} />
                    Phòng
                  </h4>
                  <ImageDisplay
                    images={selectedBooking.Phong?.anh || []}
                    width={200}
                    height={150}
                  />
                </div>
              </div>
            </div>

            {/* Information Table */}
            <div>
              <h3
                style={{
                  color: "#52c41a",
                  borderBottom: "2px solid #52c41a",
                  paddingBottom: "8px",
                  marginBottom: "16px",
                  fontSize: "16px",
                }}
              >
                <FileTextOutlined style={{ marginRight: "8px" }} />
                Thông tin chi tiết
              </h3>
              <Table
                dataSource={[
                  {
                    key: "customer",
                    category: (
                      <>
                        <UserOutlined style={{ marginRight: "8px" }} />
                        Khách hàng
                      </>
                    ),
                    details: [
                      {
                        label: "Họ tên",
                        value: selectedBooking.NguoiDung?.hoTen,
                      },
                      {
                        label: "Email",
                        value: selectedBooking.NguoiDung?.email,
                      },
                      {
                        label: "Số điện thoại",
                        value: selectedBooking.NguoiDung?.sdt,
                      },
                      {
                        label: "Trạng thái",
                        value: selectedBooking.trangThai,
                        isTag: true,
                      },
                    ],
                  },
                  {
                    key: "booking",
                    category: (
                      <>
                        <HomeOutlined style={{ marginRight: "8px" }} />
                        Đặt phòng
                      </>
                    ),
                    details: [
                      {
                        label: "Phòng",
                        value: selectedBooking.Phong?.tenPhong,
                      },
                      {
                        label: "Loại đặt",
                        value: selectedBooking.loaiDat,
                        isTag: true,
                      },
                      {
                        label: "Ngày nhận",
                        value: dayjs(selectedBooking.ngayNhan).format(
                          "DD/MM/YYYY"
                        ),
                      },
                      {
                        label: "Ngày trả",
                        value: dayjs(selectedBooking.ngayTra).format(
                          "DD/MM/YYYY"
                        ),
                      },
                      {
                        label: "Số người lớn",
                        value: selectedBooking.soNguoiLon,
                      },
                      {
                        label: "Số trẻ em",
                        value: selectedBooking.soTreEm || 0,
                      },
                      ...(selectedBooking.soGio
                        ? [{ label: "Số giờ", value: selectedBooking.soGio }]
                        : []),
                      ...(selectedBooking.soNgay
                        ? [{ label: "Số ngày", value: selectedBooking.soNgay }]
                        : []),
                    ],
                  },
                  {
                    key: "payment",
                    category: (
                      <>
                        <DollarOutlined style={{ marginRight: "8px" }} />
                        Thanh toán
                      </>
                    ),
                    details: [
                      {
                        label: "Tổng tiền gốc",
                        value: `${
                          selectedBooking.tongTienGoc?.toLocaleString() || 0
                        } VNĐ`,
                        isHighlight: true,
                      },
                      {
                        label: "Tổng tiền sau giảm",
                        value: `${
                          selectedBooking.tongTienSauGiam?.toLocaleString() || 0
                        } VNĐ`,
                        isHighlight: true,
                      },
                    ],
                  },
                  {
                    key: "additional",
                    category: (
                      <>
                        <CalendarOutlined style={{ marginRight: "8px" }} />
                        Thông tin bổ sung
                      </>
                    ),
                    details: [
                      {
                        label: "Ngày đặt",
                        value: dayjs(selectedBooking.ngayDat).format(
                          "DD/MM/YYYY HH:mm"
                        ),
                      },
                      ...(selectedBooking.ghiChu
                        ? [{ label: "Ghi chú", value: selectedBooking.ghiChu }]
                        : []),
                    ],
                  },
                ]}
                columns={[
                  {
                    title: "Danh mục",
                    dataIndex: "category",
                    key: "category",
                    width: 200,
                    render: (category: any) => (
                      <div
                        style={{
                          fontWeight: "bold",
                          fontSize: "14px",
                          color: "#1890ff",
                          padding: "8px",
                          background: "#f0f8ff",
                          borderRadius: "4px",
                          textAlign: "center",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        {category}
                      </div>
                    ),
                  },
                  {
                    title: "Chi tiết",
                    dataIndex: "details",
                    key: "details",
                    render: (details: any[]) => (
                      <div style={{ padding: "8px" }}>
                        {details.map((detail, index) => (
                          <div
                            key={index}
                            style={{
                              marginBottom: "8px",
                              padding: "8px",
                              background: "#fafafa",
                              borderRadius: "4px",
                              border: "1px solid #f0f0f0",
                            }}
                          >
                            <div
                              style={{
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                              }}
                            >
                              <span
                                style={{ fontWeight: "bold", color: "#666" }}
                              >
                                {detail.label}:
                              </span>
                              <span
                                style={{
                                  color: detail.isHighlight
                                    ? "#52c41a"
                                    : "#333",
                                  fontWeight: detail.isHighlight
                                    ? "bold"
                                    : "normal",
                                  fontSize: detail.isHighlight
                                    ? "16px"
                                    : "14px",
                                }}
                              >
                                {detail.isTag ? (
                                  <Tag
                                    color={
                                      detail.value === "Đã xác nhận"
                                        ? "green"
                                        : detail.value === "Hoàn thành"
                                        ? "blue"
                                        : detail.value === "Đã hủy"
                                        ? "red"
                                        : detail.value === "Theo giờ"
                                        ? "blue"
                                        : detail.value === "Qua đêm"
                                        ? "green"
                                        : "orange"
                                    }
                                  >
                                    {detail.value}
                                  </Tag>
                                ) : (
                                  detail.value
                                )}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    ),
                  },
                ]}
                pagination={false}
                showHeader={true}
                size="middle"
                style={{
                  background: "white",
                  borderRadius: "8px",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                }}
              />
            </div>
          </div>
        )}
      </Modal>

      <Modal
        title="Kết quả kiểm tra khả dụng"
        open={availabilityModalVisible}
        onCancel={() => setAvailabilityModalVisible(false)}
        footer={[
          <Button
            key="close"
            onClick={() => setAvailabilityModalVisible(false)}
          >
            Đóng
          </Button>,
        ]}
      >
        {availabilityResult && (
          <div>
            <p>
              <strong>Trạng thái:</strong>
              <Tag color={availabilityResult.available ? "green" : "red"}>
                {availabilityResult.available ? "Có sẵn" : "Không có sẵn"}
              </Tag>
            </p>
            <p>
              <strong>Thông báo:</strong> {availabilityResult.message}
            </p>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default BookingManagement;
