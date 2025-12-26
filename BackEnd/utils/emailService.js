const nodemailer = require("nodemailer");
require("dotenv").config();
const { generateInvoicePDF } = require("./pdfService");

// Cấu hình transporter cho Gmail
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

/**
 * Gửi email xác nhận đặt phòng với hóa đơn
 * @param {Object} bookingInfo - Thông tin đặt phòng
 * @param {string} bookingInfo.userEmail - Email người nhận
 * @param {string} bookingInfo.userName - Tên khách hàng
 * @param {string} bookingInfo.bookingId - Mã đặt phòng
 * @param {string} bookingInfo.hotelName - Tên khách sạn
 * @param {string} bookingInfo.hotelAddress - Địa chỉ khách sạn
 * @param {string} bookingInfo.roomName - Tên phòng
 * @param {string} bookingInfo.checkInDate - Ngày nhận phòng
 * @param {string} bookingInfo.checkOutDate - Ngày trả phòng
 * @param {string} bookingInfo.bookingType - Loại đặt phòng
 * @param {number} bookingInfo.basePrice - Giá gốc
 * @param {number} bookingInfo.discountAmount - Số tiền giảm giá
 * @param {number} bookingInfo.finalPrice - Tổng tiền
 * @param {string} bookingInfo.paymentMethod - Phương thức thanh toán
 * @param {string} bookingInfo.promotionName - Tên khuyến mãi (nếu có)
 */
async function sendBookingConfirmationEmail(bookingInfo) {
  try {
    const {
      userEmail,
      userName,
      bookingId,
      hotelName,
      hotelAddress,
      roomName,
      checkInDate,
      checkOutDate,
      bookingType,
      basePrice,
      discountAmount,
      finalPrice,
      paymentMethod,
      promotionName,
    } = bookingInfo;

    // Format ngày giờ
    const formatDateTime = (dateString) => {
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Format tiền tệ
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount);
    };

    // Tên phương thức thanh toán
    const paymentMethodNames = {
      momo: "MoMo",
      zalopay: "ZaloPay",
      shopeepay: "ShopeePay",
      credit: "Thẻ tín dụng",
      atm: "Chuyển khoản ATM",
      hotel: "Thanh toán tại khách sạn",
    };

    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Xác nhận đặt phòng</title>

  <style>
    body {
      margin: 0;
      padding: 0;
      background-color: #f2f4f8;
      font-family: Arial, Helvetica, sans-serif;
      color: #333;
    }

    table {
      border-collapse: collapse;
      width: 100%;
    }

    .email-wrapper {
      max-width: 600px;
      margin: 0 auto;
      background-color: #ffffff;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 15px rgba(0,0,0,0.08);
    }

    .header {
      background-color: #4f46e5;
      color: #ffffff;
      text-align: center;
      padding: 28px 20px;
    }

    .header h1 {
      margin: 0;
      font-size: 24px;
      letter-spacing: 0.5px;
    }

    .content {
      padding: 28px;
    }

    .booking-id {
      background-color: #eef2ff;
      border-left: 4px solid #4f46e5;
      padding: 14px 16px;
      margin: 20px 0;
      font-size: 16px;
      font-weight: bold;
      color: #3730a3;
    }

    .section-title {
      font-size: 18px;
      color: #4f46e5;
      margin: 30px 0 12px;
      border-bottom: 1px solid #e5e7eb;
      padding-bottom: 8px;
    }

    .info-table td {
      padding: 8px 0;
      font-size: 14px;
      vertical-align: top;
    }

    .info-label {
      width: 40%;
      font-weight: bold;
      color: #6b7280;
    }

    .price-box {
      background-color: #f9fafb;
      border-radius: 6px;
      padding: 16px;
      margin-top: 12px;
    }

    .price-row td {
      padding: 6px 0;
      font-size: 14px;
    }

    .discount {
      color: #16a34a;
    }

    .total-row td {
      border-top: 2px solid #4f46e5;
      padding-top: 12px;
      font-size: 18px;
      font-weight: bold;
      color: #4f46e5;
    }

    .note {
      background-color: #fff7ed;
      border-left: 4px solid #f59e0b;
      padding: 16px;
      margin: 24px 0;
      font-size: 14px;
      color: #92400e;
    }

    .invoice {
      background-color: #ecfdf5;
      border-left: 4px solid #10b981;
      padding: 16px;
      margin: 24px 0;
      font-size: 14px;
      color: #065f46;
    }

    .footer {
      background-color: #f3f4f6;
      text-align: center;
      padding: 20px;
      font-size: 12px;
      color: #6b7280;
    }

    @media (max-width: 600px) {
      .content {
        padding: 20px;
      }
    }
  </style>
</head>

<body>
  <table>
    <tr>
      <td align="center">
        <table class="email-wrapper">
          
          <!-- CONTENT -->
          <tr>
            <td class="content">
              <p>Xin chào <strong>${userName}</strong>,</p>
              <p>Chúng tôi đã nhận được đơn đặt phòng của bạn với thông tin chi tiết bên dưới:</p>


              <div class="section-title">Thông tin khách sạn</div>
              <table class="info-table">
                <tr>
                  <td class="info-label">Khách sạn:</td>
                  <td>${hotelName}</td>
                </tr>
                <tr>
                  <td class="info-label">Địa chỉ:</td>
                  <td>${hotelAddress}</td>
                </tr>
                <tr>
                  <td class="info-label">Loại phòng:</td>
                  <td>${roomName}</td>
                </tr>
              </table>

              <div class="section-title">Thông tin đặt phòng</div>
              <table class="info-table">
                <tr>
                  <td class="info-label">Loại đặt:</td>
                  <td>${bookingType}</td>
                </tr>
                <tr>
                  <td class="info-label">Nhận phòng:</td>
                  <td>${formatDateTime(checkInDate)}</td>
                </tr>
                <tr>
                  <td class="info-label">Trả phòng:</td>
                  <td>${formatDateTime(checkOutDate)}</td>
                </tr>
              </table>

              <div class="section-title">Thanh toán</div>
              <div class="price-box">
                <table width="100%">
                  <tr class="price-row">
                    <td>Giá phòng</td>
                    <td align="right">${formatCurrency(basePrice)}</td>
                  </tr>

                  ${
                    discountAmount > 0
                      ? `
                  <tr class="price-row discount">
                    <td>Giảm giá ${
                      promotionName ? `(${promotionName})` : ""
                    }</td>
                    <td align="right">- ${formatCurrency(discountAmount)}</td>
                  </tr>`
                      : ""
                  }

                  <tr class="total-row">
                    <td>Tổng tiền</td>
                    <td align="right">${formatCurrency(finalPrice)}</td>
                  </tr>

                  <tr class="price-row">
                    <td>Phương thức</td>
                    <td align="right">${
                      paymentMethodNames[paymentMethod] || paymentMethod
                    }</td>
                  </tr>
                </table>
              </div>

              <div class="note">
                <strong>Lưu ý:</strong>
                <ul>
                  <li>Xuất trình CCCD/CMND khi nhận phòng</li>
                  <li>Nhận phòng: 14:00 – Trả phòng: 12:00</li>
                  <li>Liên hệ trước nếu đến muộn</li>
                </ul>
              </div>

              <div class="invoice">
                <strong>Hóa đơn điện tử</strong>
                <p>Hóa đơn PDF đã được đính kèm trong email này.</p>
              </div>

              <p>Chúc bạn có một kỳ nghỉ thật tuyệt vời!</p>
            </td>
          </tr>

          <!-- FOOTER -->
          <tr>
            <td class="footer">
              <p><strong>Hệ thống Booking Hotel</strong></p>
              <p>Email tự động – vui lòng không phản hồi</p>
              <p>© ${new Date().getFullYear()} Booking Hotel</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`;

    // Tạo PDF hóa đơn
    let pdfBuffer = null;
    try {
      const pdfData = {
        // Thông tin đặt phòng
        maDatPhong: bookingId,
        ngayDat: bookingInfo.ngayDat || new Date(),
        loaiDat: bookingType,
        trangThai: bookingInfo.trangThai || "Đã xác nhận",

        // Thông tin khách hàng
        tenKhachHang: userName,
        email: userEmail,
        sdt: (() => {
          // Ưu tiên lấy từ userPhone
          if (bookingInfo.userPhone) return bookingInfo.userPhone;

          // Fallback: trích xuất từ ghiChu (format: "Thông tin người đặt: Tên - 0xxxxxxxxx")
          const ghiChu = bookingInfo.ghiChu || bookingInfo.notes || "";
          const phoneMatch = ghiChu.match(/(\d{10,11})/);
          if (phoneMatch) return phoneMatch[1];

          return "";
        })(),

        // Thông tin khách sạn
        tenKhachSan: hotelName,
        diaChiKhachSan: hotelAddress,
        tinhThanh: bookingInfo.tinhThanh || "",
        hangSao: bookingInfo.hangSao || 0,

        // Thông tin phòng
        tenPhong: roomName,
        dienTich: bookingInfo.dienTich || "",

        // Thời gian đặt phòng
        ngayNhan: checkInDate,
        ngayTra: checkOutDate,
        soGio: bookingInfo.soGio || bookingInfo.duration || null,
        soNgay: bookingInfo.soNgay || null,

        // Số người
        soNguoiLon: bookingInfo.soNguoiLon || 1,
        soTreEm: bookingInfo.soTreEm || 0,

        // Thanh toán
        giaPhong: basePrice,
        giamGia: discountAmount || 0,
        tenKhuyenMai: promotionName || "",
        tongTien: finalPrice,
        phuongThucThanhToan: paymentMethodNames[paymentMethod] || paymentMethod,
        trangThaiThanhToan: bookingInfo.paymentStatus || "Đã thanh toán",

        // Ghi chú
        ghiChu: bookingInfo.ghiChu || bookingInfo.notes || "",
      };

      pdfBuffer = await generateInvoicePDF(pdfData);
    } catch (pdfError) {
      console.error("Error generating PDF invoice:", pdfError);
      // Tiếp tục gửi email mà không có PDF
    }

    // Cấu hình email
    const mailOptions = {
      from: {
        name: "Booking Hotel",
        address: process.env.EMAIL_USER,
      },
      to: userEmail,
      subject: `Xác nhận đặt phòng #${bookingId} - ${hotelName}`,
      html: htmlContent,
      // Text version cho email clients không hỗ trợ HTML
      text: `
Xác nhận đặt phòng

Xin chào ${userName},

Mã đặt phòng: ${bookingId}

THÔNG TIN KHÁCH SẠN:
- Tên: ${hotelName}
- Địa chỉ: ${hotelAddress}
- Phòng: ${roomName}

THÔNG TIN ĐẶT PHÒNG:
- Loại đặt: ${bookingType}
- Nhận phòng: ${formatDateTime(checkInDate)}
- Trả phòng: ${formatDateTime(checkOutDate)}

CHI TIẾT THANH TOÁN:
- Giá phòng: ${formatCurrency(basePrice)}
${
  discountAmount > 0 ? `- Giảm giá: -${formatCurrency(discountAmount)}\n` : ""
}- Tổng tiền: ${formatCurrency(finalPrice)}
- Phương thức: ${paymentMethodNames[paymentMethod] || paymentMethod}

Cảm ơn bạn đã đặt phòng!

Vui lòng xem file đính kèm để có hóa đơn điện tử chi tiết.
      `,
      // Đính kèm PDF hóa đơn
      attachments: pdfBuffer
        ? [
            {
              filename: `HoaDon_${bookingId}_${
                new Date().toISOString().split("T")[0]
              }.pdf`,
              content: pdfBuffer,
              contentType: "application/pdf",
            },
          ]
        : [],
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      hasPdfAttachment: !!pdfBuffer,
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
    };
  }
}

// Verify email configuration
async function verifyEmailConfig() {
  try {
    await transporter.verify();
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  sendBookingConfirmationEmail,
  verifyEmailConfig,
  sendCompletedBookingsReport,
};

/**
 * Gửi email báo cáo danh sách đơn đặt phòng hoàn thành
 * @param {Array} completedBookings - Danh sách đơn đặt phòng hoàn thành
 * @param {string} recipientEmail - Email người nhận (mặc định là EMAIL_USER)
 */
async function sendCompletedBookingsReport(
  completedBookings,
  recipientEmail = null
) {
  try {
    const toEmail = recipientEmail || process.env.EMAIL_USER;

    if (!completedBookings || completedBookings.length === 0) {
      return {
        success: false,
        error: "Không có dữ liệu để gửi",
      };
    }

    // Format tiền tệ
    const formatCurrency = (amount) => {
      return new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(amount || 0);
    };

    // Format ngày giờ
    const formatDateTime = (dateString) => {
      if (!dateString) return "N/A";
      const date = new Date(dateString);
      return date.toLocaleString("vi-VN", {
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
      });
    };

    // Tính tổng doanh thu
    const totalRevenue = completedBookings.reduce(
      (sum, b) => sum + (b.tongTienSauGiam || 0),
      0
    );
    const reportDate = new Date().toLocaleDateString("vi-VN");

    // Tạo HTML content
    const htmlContent = `
<!DOCTYPE html>
<html lang="vi">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>Báo cáo đơn đặt phòng hoàn thành</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 0; padding: 20px; background-color: #f5f5f5; }
    .container { max-width: 900px; margin: 0 auto; background: white; border-radius: 10px; overflow: hidden; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
    .header { background: linear-gradient(135deg, #1890ff, #52c41a); color: white; padding: 30px; text-align: center; }
    .header h1 { margin: 0; font-size: 24px; }
    .header p { margin: 10px 0 0; opacity: 0.9; }
    .summary { display: flex; justify-content: space-around; padding: 20px; background: #f8f9fa; border-bottom: 1px solid #e0e0e0; }
    .summary-item { text-align: center; }
    .summary-value { font-size: 28px; font-weight: bold; color: #1890ff; }
    .summary-label { color: #666; font-size: 14px; margin-top: 5px; }
    .content { padding: 20px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { background: #1890ff; color: white; padding: 12px 8px; text-align: left; }
    td { padding: 10px 8px; border-bottom: 1px solid #e0e0e0; }
    tr:hover { background: #f5f5f5; }
    .status { display: inline-block; padding: 4px 8px; border-radius: 4px; font-size: 12px; background: #52c41a; color: white; }
    .footer { background: #f8f9fa; padding: 20px; text-align: center; color: #666; font-size: 12px; }
    .amount { color: #1890ff; font-weight: bold; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>BÁO CÁO ĐƠN ĐẶT PHÒNG HOÀN THÀNH</h1>
      <p>Ngày xuất báo cáo: ${reportDate}</p>
    </div>
    
    <div class="summary">
      <div class="summary-item">
        <div class="summary-value">${completedBookings.length}</div>
        <div class="summary-label">Tổng đơn hoàn thành</div>
      </div>
      <div class="summary-item">
        <div class="summary-value" style="color: #52c41a;">${formatCurrency(
          totalRevenue
        )}</div>
        <div class="summary-label">Tổng doanh thu</div>
      </div>
    </div>
    
    <div class="content">
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
          </tr>
        </thead>
        <tbody>
          ${completedBookings
            .map(
              (booking, index) => `
            <tr>
              <td>${index + 1}</td>
              <td>${booking.tenNguoiDat || "N/A"}</td>
              <td>${booking.tenKS || "N/A"}</td>
              <td>${booking.tenPhong || "N/A"}</td>
              <td>${booking.loaiDat || "N/A"}</td>
              <td>${formatDateTime(booking.ngayNhan)}</td>
              <td>${formatDateTime(booking.ngayTra)}</td>
              <td class="amount">${formatCurrency(booking.tongTienSauGiam)}</td>
              <td>${formatDateTime(booking.completedAt)}</td>
            </tr>
          `
            )
            .join("")}
        </tbody>
      </table>
    </div>
    
    <div class="footer">
      <p><strong>Hệ thống Booking Hotel</strong></p>
      <p>Email tự động - Vui lòng không phản hồi</p>
      <p>© ${new Date().getFullYear()} Booking Hotel</p>
    </div>
  </div>
</body>
</html>
    `;

    // Cấu hình email
    const mailOptions = {
      from: {
        name: "Booking Hotel Admin",
        address: process.env.EMAIL_USER,
      },
      to: toEmail,
      subject: `Báo cáo đơn đặt phòng hoàn thành - ${reportDate} (${completedBookings.length} đơn)`,
      html: htmlContent,
      text: `
BÁO CÁO ĐƠN ĐẶT PHÒNG HOÀN THÀNH
Ngày: ${reportDate}

TỔNG QUAN:
- Số đơn hoàn thành: ${completedBookings.length}
- Tổng doanh thu: ${formatCurrency(totalRevenue)}

CHI TIẾT:
${completedBookings
  .map(
    (b, i) =>
      `${i + 1}. ${b.tenNguoiDat} - ${b.tenKS} - ${
        b.tenPhong
      } - ${formatCurrency(b.tongTienSauGiam)}`
  )
  .join("\n")}

---
Hệ thống Booking Hotel
      `,
    };

    // Gửi email
    const info = await transporter.sendMail(mailOptions);

    return {
      success: true,
      messageId: info.messageId,
      sentTo: toEmail,
      bookingsCount: completedBookings.length,
      totalRevenue: totalRevenue,
    };
  } catch (error) {
    console.error("Error sending completed bookings report:", error);
    return {
      success: false,
      error: error.message,
    };
  }
}
