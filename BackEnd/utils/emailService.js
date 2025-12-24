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
      
      console.log('📄 PDF Data - sdt:', pdfData.sdt);
      console.log('📄 bookingInfo.userPhone:', bookingInfo.userPhone);
      
      pdfBuffer = await generateInvoicePDF(pdfData);
      console.log("PDF invoice generated successfully");
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
};
