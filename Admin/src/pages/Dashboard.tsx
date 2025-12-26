import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag, Tabs, Badge, Button, Space, message } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
  FileExcelOutlined,
  PrinterOutlined,
  MailOutlined,
  CheckCircleOutlined,
} from "@ant-design/icons";
import { Column, Pie, Line } from "@ant-design/charts";
import { datPhongService } from "../services/datPhongService";
import { nguoiDungService } from "../services/nguoiDungService";
import { khachSanService } from "../services/khachSanService";
import { danhGiaService } from "../services/danhGiaService";
import { DatPhong } from "../types";
import dayjs from "dayjs";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<DatPhong[]>([]);
  const [allBookings, setAllBookings] = useState<DatPhong[]>([]);
  const [completedBookings, setCompletedBookings] = useState<any[]>([]);
  const [chartData, setChartData] = useState<any>({
    dailyBookings: [],
    statusDistribution: [],
    dailyRevenue: [],
    topHotels: [],
    completedBookings: [],
    topRatedHotels: [],
    completedBookingsLine: [], // Biểu đồ đường cho đơn hoàn thành
  });

  useEffect(() => {
    loadDashboardData();
  }, []);

  const calculateChartData = (
    bookings: DatPhong[],
    hotels: any[],
    _ratings: any[]
  ) => {
    // Biểu đồ đặt phòng theo ngày (7 ngày gần nhất)
    const dailyBookings = [];
    const dailyRevenue = [];

    for (let i = 6; i >= 0; i--) {
      const day = dayjs().subtract(i, "day");
      const dayStr = day.format("YYYY-MM-DD");
      const dayLabel = day.format("DD/MM");

      const dayBookings = bookings.filter(
        (booking) => dayjs(booking.ngayDat).format("YYYY-MM-DD") === dayStr
      );

      const dayRevenue = dayBookings.reduce(
        (sum, booking) => sum + (booking.tongTienSauGiam || 0),
        0
      );

      dailyBookings.push({
        day: dayLabel,
        bookings: dayBookings.length,
      });

      dailyRevenue.push({
        day: dayLabel,
        revenue: dayRevenue,
      });
    }

    // Biểu đồ phân bố trạng thái
    const statusCount = bookings.reduce((acc, booking) => {
      const status = booking.trangThai || "Chưa xác định";
      acc[status] = (acc[status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const statusDistribution = Object.entries(statusCount).map(
      ([status, count]) => ({
        status,
        count,
        percentage: ((count / bookings.length) * 100).toFixed(1),
      })
    );

    // Top khách sạn có nhiều đặt phòng nhất
    const hotelBookingCount = bookings.reduce((acc, booking) => {
      const hotelName = booking.KhachSan?.tenKS || "Không xác định";
      acc[hotelName] = (acc[hotelName] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const topHotels = Object.entries(hotelBookingCount)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([hotelName, count]) => ({
        hotel: hotelName,
        bookings: count,
      }));

    // Biểu đồ đơn đặt phòng đã hoàn thành theo ngày
    const completedBookings = [];
    console.log("📊 Total bookings:", bookings.length);
    console.log("📊 Booking statuses:", [
      ...new Set(bookings.map((b) => b.trangThai)),
    ]);

    for (let i = 6; i >= 0; i--) {
      const day = dayjs().subtract(i, "day");
      const dayStr = day.format("YYYY-MM-DD");
      const dayLabel = day.format("DD/MM");

      const dayCompletedBookings = bookings.filter(
        (booking) =>
          dayjs(booking.ngayDat).format("YYYY-MM-DD") === dayStr &&
          (booking.trangThai === "Đã trả phòng" ||
            booking.trangThai === "Hoàn thành" ||
            booking.trangThai === "Đã thanh toán" ||
            booking.trangThai === "Đã xác nhận")
      );
      completedBookings.push({
        day: dayLabel,
        completed: dayCompletedBookings.length,
      });
    }

    console.log("📊 Completed bookings chart data:", completedBookings);

    // Biểu đồ khách sạn có đánh giá cao nhất
    const hotelRatings = hotels
      .filter((hotel) => hotel.hangSao > 0) // Chỉ lấy khách sạn có đánh giá
      .map((hotel) => ({
        hotel: hotel.tenKS,
        rating: hotel.hangSao,
        reviewCount: hotel.diemDanhGia || 0,
      }))
      .sort((a, b) => b.rating - a.rating) // Sắp xếp theo điểm đánh giá giảm dần
      .slice(0, 5); // Lấy top 5

    return {
      dailyBookings,
      statusDistribution,
      dailyRevenue,
      topHotels,
      completedBookings,
      topRatedHotels: hotelRatings,
    };
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      const [users, hotels, bookings, ratings, completedBookingsData] = await Promise.all([
        nguoiDungService.getAll(),
        khachSanService.getAll(),
        datPhongService.getAll(),
        danhGiaService.getAll(),
        datPhongService.getCompletedBookings(),
      ]);

      // Ensure all data is arrays
      const usersData = Array.isArray(users) ? users : [];
      const hotelsData = Array.isArray(hotels) ? hotels : [];
      const bookingsData = Array.isArray(bookings) ? bookings : [];
      const ratingsData = Array.isArray(ratings) ? ratings : [];

      const totalRevenue = bookingsData.reduce(
        (sum, booking) => sum + (booking.tongTienSauGiam || 0),
        0
      );

      setStats({
        totalUsers: usersData.length,
        totalHotels: hotelsData.length,
        totalBookings: bookingsData.length,
        totalRevenue,
      });

      // Lấy 10 booking gần nhất
      const sorted = [...bookingsData].sort(
        (a, b) => new Date(b.ngayDat).getTime() - new Date(a.ngayDat).getTime()
      );
      setRecentBookings(sorted.slice(0, 10));
      setAllBookings(sorted);

      // Xử lý và lưu completed bookings từ completedBookings.json
      const completedData = Array.isArray(completedBookingsData) ? completedBookingsData : [];
      const sortedCompleted = [...completedData].sort(
        (a, b) => new Date(b.ngayDat).getTime() - new Date(a.ngayDat).getTime()
      );
      setCompletedBookings(sortedCompleted);

      // Tạo dữ liệu biểu đồ đường cho đơn hoàn thành theo ngày
      const completedBookingsLineData = [];
      for (let i = 29; i >= 0; i--) {
        const day = dayjs().subtract(i, "day");
        const dayStr = day.format("YYYY-MM-DD");
        const dayLabel = day.format("DD/MM");

        // Đếm số đơn hoàn thành trong ngày (dựa trên completedAt)
        const completedCount = completedData.filter((b: any) => {
          if (!b.completedAt) return false;
          const completedDate = dayjs(b.completedAt).format("YYYY-MM-DD");
          return completedDate === dayStr;
        }).length;

        // Tính doanh thu từ đơn hoàn thành trong ngày
        const completedRevenue = completedData.filter((b: any) => {
          if (!b.completedAt) return false;
          const completedDate = dayjs(b.completedAt).format("YYYY-MM-DD");
          return completedDate === dayStr;
        }).reduce((sum: number, b: any) => sum + (b.tongTienSauGiam || 0), 0);

        completedBookingsLineData.push({
          day: dayLabel,
          count: completedCount,
          revenue: completedRevenue,
        });
      }

      // Tính toán dữ liệu cho biểu đồ
      const chartData = calculateChartData(
        bookingsData,
        hotelsData,
        ratingsData
      );
      
      // Merge với dữ liệu biểu đồ đường completed bookings
      setChartData({
        ...chartData,
        completedBookingsLine: completedBookingsLineData,
      } as any);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      // Set empty arrays on error
      setStats({
        totalUsers: 0,
        totalHotels: 0,
        totalBookings: 0,
        totalRevenue: 0,
      });
      setRecentBookings([]);
    } finally {
      setLoading(false);
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
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Đơn hoàn thành");

    // Auto-fit column width
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
          table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 12px; }
          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
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
              <th>Ngày hoàn thành</th>
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
      title: "Ngày đặt",
      dataIndex: "ngayDat",
      key: "ngayDat",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTienSauGiam",
      key: "tongTienSauGiam",
      render: (amount: number) => `${(amount || 0).toLocaleString()} VNĐ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (status: string) => {
        let color = "default";
        switch (status) {
          case "Đã xác nhận":
            color = "green";
            break;
          case "Chờ thanh toán":
            color = "orange";
            break;
          case "Đã hủy":
            color = "red";
            break;
          case "Hoàn thành":
          case "Đã hoàn thành":
            color = "blue";
            break;
          default:
            color = "default";
        }
        return <Tag color={color}>{status}</Tag>;
      },
    },
  ];

  // Columns cho completed bookings (dữ liệu từ completedBookings.json có cấu trúc khác)
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
      title: "Ngày đặt",
      dataIndex: "ngayDat",
      key: "ngayDat",
      render: (date: string) => dayjs(date).format("DD/MM/YYYY HH:mm"),
    },
    {
      title: "Tổng tiền",
      dataIndex: "tongTienSauGiam",
      key: "tongTienSauGiam",
      render: (amount: number) => `${(amount || 0).toLocaleString()} VNĐ`,
    },
    {
      title: "Trạng thái",
      dataIndex: "trangThai",
      key: "trangThai",
      render: (status: string) => <Tag color="blue">{status}</Tag>,
    },
  ];

  return (
    <div>
      <h1 style={{ marginBottom: "24px" }}>Dashboard</h1>

      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Người dùng"
              value={stats.totalUsers}
              prefix={<UserOutlined />}
              valueStyle={{ color: "#3f8600" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Khách sạn"
              value={stats.totalHotels}
              prefix={<HomeOutlined />}
              valueStyle={{ color: "#1890ff" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Đặt phòng"
              value={stats.totalBookings}
              prefix={<CalendarOutlined />}
              valueStyle={{ color: "#cf1322" }}
            />
          </Card>
        </Col>
        <Col span={6}>
          <Card loading={loading}>
            <Statistic
              title="Tổng Doanh thu"
              value={stats.totalRevenue}
              prefix={<DollarOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: "#722ed1" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Thống kê đơn hoàn thành */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={12}>
          <Card loading={loading} style={{ background: "linear-gradient(135deg, #52c41a 0%, #73d13d 100%)" }}>
            <Statistic
              title={<span style={{ color: "white" }}>Doanh thu đơn hoàn thành</span>}
              value={completedBookings.reduce((sum, b) => sum + (b.tongTienSauGiam || 0), 0)}
              prefix={<CheckCircleOutlined />}
              suffix="VNĐ"
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card loading={loading} style={{ background: "linear-gradient(135deg, #1890ff 0%, #40a9ff 100%)" }}>
            <Statistic
              title={<span style={{ color: "white" }}>Số đơn đã hoàn thành</span>}
              value={completedBookings.length}
              prefix={<CheckCircleOutlined />}
              suffix="đơn"
              valueStyle={{ color: "white", fontWeight: "bold" }}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={12}>
          <Card title="Đặt phòng theo ngày" loading={loading}>
            <Column
              data={chartData.dailyBookings}
              xField="day"
              yField="bookings"
              color="#1890ff"
              height={300}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Phân bố trạng thái đặt phòng" loading={loading}>
            <Pie
              data={chartData.statusDistribution}
              angleField="count"
              colorField="status"
              radius={0.8}
              height={300}
            />
          </Card>
        </Col>
      </Row>

      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={12}>
          <Card title="Doanh thu theo ngày" loading={loading}>
            <Line
              data={chartData.dailyRevenue}
              xField="day"
              yField="revenue"
              color="#52c41a"
              height={300}
              smooth={true}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Top khách sạn có nhiều đặt phòng nhất" loading={loading}>
            <Column
              data={chartData.topHotels}
              xField="hotel"
              yField="bookings"
              color="#722ed1"
              height={300}
            />
          </Card>
        </Col>
      </Row>

      {/* Biểu đồ mới */}
      <Row gutter={16} style={{ marginBottom: "24px" }}>
        <Col span={12}>
          <Card title="Đơn đặt phòng đã hoàn thành theo ngày" loading={loading}>
            <Column
              data={chartData.completedBookings}
              xField="day"
              yField="completed"
              color="#13c2c2"
              height={300}
            />
          </Card>
        </Col>
        <Col span={12}>
          <Card title="Khách sạn có đánh giá cao nhất" loading={loading}>
            <Column
              data={chartData.topRatedHotels}
              xField="hotel"
              yField="rating"
              color="#fa8c16"
              height={300}
            />
          </Card>
        </Col>
      </Row>

      <Card title="Quản lý đơn đặt phòng" loading={loading}>
        <Tabs
          defaultActiveKey="confirmed"
          items={[
            {
              key: "confirmed",
              label: (
                <Badge
                  count={allBookings.filter((b) => b.trangThai === "Đã xác nhận").length}
                  offset={[10, 0]}
                  style={{ backgroundColor: "#52c41a" }}
                >
                  <span style={{ paddingRight: 20 }}>Đã xác nhận</span>
                </Badge>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={allBookings.filter((b) => b.trangThai === "Đã xác nhận")}
                  rowKey="maDatPhong"
                  pagination={{ pageSize: 5 }}
                />
              ),
            },
            {
              key: "pending",
              label: (
                <Badge
                  count={allBookings.filter((b) => b.trangThai === "Chờ thanh toán").length}
                  offset={[10, 0]}
                  style={{ backgroundColor: "#faad14" }}
                >
                  <span style={{ paddingRight: 20 }}>Chờ xác nhận thanh toán</span>
                </Badge>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={allBookings.filter((b) => b.trangThai === "Chờ thanh toán")}
                  rowKey="maDatPhong"
                  pagination={{ pageSize: 5 }}
                />
              ),
            },
            {
              key: "cancelled",
              label: (
                <Badge
                  count={allBookings.filter((b) => b.trangThai === "Đã hủy").length}
                  offset={[10, 0]}
                  style={{ backgroundColor: "#ff4d4f" }}
                >
                  <span style={{ paddingRight: 20 }}>Đã hủy</span>
                </Badge>
              ),
              children: (
                <Table
                  columns={columns}
                  dataSource={allBookings.filter((b) => b.trangThai === "Đã hủy")}
                  rowKey="maDatPhong"
                  pagination={{ pageSize: 5 }}
                />
              ),
            },
            {
              key: "completed",
              label: (
                <Badge
                  count={completedBookings.length}
                  offset={[10, 0]}
                  style={{ backgroundColor: "#1890ff" }}
                >
                  <span style={{ paddingRight: 20 }}>Hoàn thành</span>
                </Badge>
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
                    pagination={{ pageSize: 5, showSizeChanger: false }}
                  />
                </div>
              ),
            },
          ]}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
