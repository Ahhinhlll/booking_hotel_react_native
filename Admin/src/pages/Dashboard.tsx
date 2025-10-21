import { useEffect, useState } from "react";
import { Card, Row, Col, Statistic, Table, Tag } from "antd";
import {
  UserOutlined,
  HomeOutlined,
  CalendarOutlined,
  DollarOutlined,
} from "@ant-design/icons";
import { Column, Pie, Line } from "@ant-design/charts";
import { datPhongService } from "../services/datPhongService";
import { nguoiDungService } from "../services/nguoiDungService";
import { khachSanService } from "../services/khachSanService";
import { danhGiaService } from "../services/danhGiaService";
import { DatPhong } from "../types";
import dayjs from "dayjs";

const Dashboard = () => {
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalHotels: 0,
    totalBookings: 0,
    totalRevenue: 0,
  });
  const [recentBookings, setRecentBookings] = useState<DatPhong[]>([]);
  const [chartData, setChartData] = useState<any>({
    dailyBookings: [],
    statusDistribution: [],
    dailyRevenue: [],
    topHotels: [],
    completedBookings: [],
    topRatedHotels: [],
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
      const [users, hotels, bookings, ratings] = await Promise.all([
        nguoiDungService.getAll(),
        khachSanService.getAll(),
        datPhongService.getAll(),
        danhGiaService.getAll(),
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

      // Tính toán dữ liệu cho biểu đồ
      const chartData = calculateChartData(
        bookingsData,
        hotelsData,
        ratingsData
      );
      setChartData(chartData as any);
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

  const columns = [
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
        const color =
          status === "Đã xác nhận"
            ? "green"
            : status === "Chờ xác nhận"
            ? "orange"
            : "red";
        return <Tag color={color}>{status}</Tag>;
      },
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

      <Card title="Đặt phòng gần đây" loading={loading}>
        <Table
          columns={columns}
          dataSource={recentBookings}
          rowKey="maDatPhong"
          pagination={{ pageSize: 5 }}
        />
      </Card>
    </div>
  );
};

export default Dashboard;
