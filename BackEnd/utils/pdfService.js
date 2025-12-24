/**
 * PDF Service - Tạo hóa đơn thanh toán dịch vụ khách sạn
 * Mẫu đơn giản, hỗ trợ tiếng Việt
 */

const pdfMake = require('pdfmake/build/pdfmake');
const pdfFonts = require('pdfmake/build/vfs_fonts');
pdfMake.vfs = pdfFonts.pdfMake ? pdfFonts.pdfMake.vfs : pdfFonts.vfs;

/**
 * Format số tiền sang định dạng VND
 */
const formatCurrency = (amount) => {
  if (!amount && amount !== 0) return '0';
  return new Intl.NumberFormat('vi-VN', {
    style: 'decimal',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

/**
 * Format ngày giờ theo định dạng Việt Nam
 */
const formatDateTime = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  const hour = d.getHours().toString().padStart(2, '0');
  const minute = d.getMinutes().toString().padStart(2, '0');
  const period = d.getHours() < 12 ? 'Sáng' : 'Chiều';
  return `${day}/${month}/${year} ${hour}:${minute} ${period}`;
};

/**
 * Format ngày theo định dạng Việt Nam
 */
const formatDate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  const day = d.getDate().toString().padStart(2, '0');
  const month = (d.getMonth() + 1).toString().padStart(2, '0');
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

/**
 * Lấy tên thứ trong tuần
 */
const getDayName = (date) => {
  const days = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
  const d = new Date(date);
  return days[d.getDay()];
};

/**
 * Tạo hóa đơn PDF theo mẫu đơn giản
 * @param {Object} bookingData - Dữ liệu đặt phòng
 * @returns {Promise<Buffer>} - Buffer chứa dữ liệu PDF
 */
const generateInvoicePDF = async (bookingData) => {
  const {
    maDatPhong,
    tenKhachHang,
    diaChi,
    sdt,
    maSoThue,
    tenKhachSan,
    diaChiKhachSan,
    sdtKhachSan,
    website,
    tenPhong,
    loaiPhong,
    ngayNhan,
    ngayTra,
    soGio,
    giaPhong,
    giamGia = 0,
    tenKhuyenMai,
    tongTien,
    phuongThucThanhToan,
    thuNgan,
    ngayDat,
    dichVuKhac = [] // Danh sách dịch vụ khác [{ten, gia, ngay}]
  } = bookingData;

  // Tính số đêm/giờ
  const checkIn = new Date(ngayNhan);
  const checkOut = new Date(ngayTra);
  const diffTime = Math.abs(checkOut - checkIn);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  const soLuong = soGio || diffDays || 1;
  const donVi = soGio ? 'giờ' : 'đêm';

  // Ngày lập hóa đơn
  const now = new Date(ngayDat || new Date());
  const ngayLap = `${getDayName(now)}, ${formatDate(now)}`;
  const soHoaDon = maDatPhong || String(Date.now()).slice(-6);

  // Tạo danh sách chi tiết
  const chiTietDichVu = [];
  
  // Thêm tiền phòng
  chiTietDichVu.push({
    ngay: formatDateTime(ngayNhan),
    chiTiet: `Tiền phòng ${tenPhong || ''} (${soLuong} ${donVi})`,
    soTien: giaPhong
  });

  // Thêm giảm giá nếu có
  if (giamGia > 0) {
    chiTietDichVu.push({
      ngay: formatDateTime(ngayNhan),
      chiTiet: `Giảm giá${tenKhuyenMai ? ` (${tenKhuyenMai})` : ''}`,
      soTien: -giamGia
    });
  }

  // Thêm dịch vụ khác nếu có
  dichVuKhac.forEach(dv => {
    chiTietDichVu.push({
      ngay: dv.ngay ? formatDateTime(dv.ngay) : formatDateTime(ngayNhan),
      chiTiet: dv.ten,
      soTien: dv.gia
    });
  });

  // Tính tổng
  const tongCong = tongTien || chiTietDichVu.reduce((sum, item) => sum + item.soTien, 0);

  // Định nghĩa document
  const docDefinition = {
    pageSize: 'A4',
    pageMargins: [40, 40, 40, 40],
    
    content: [
      // ===== HEADER =====
      {
        columns: [
          // Logo (text-based)
          {
            width: 120,
            stack: [
              { 
                text: 'Booking', 
                fontSize: 28, 
                bold: true, 
                color: '#D4A017',
                font: 'Roboto'
              },
              { 
                text: 'Hotel.vn', 
                fontSize: 14, 
                color: '#666666',
                margin: [0, -5, 0, 0]
              }
            ]
          },
          // Thông tin khách sạn
          {
            width: '*',
            stack: [
              { 
                text: tenKhachSan || 'Booking Hotel', 
                fontSize: 20, 
                bold: true,
                color: '#333333'
              },
              { 
                text: `Địa chỉ : ${diaChiKhachSan || 'N/A'}`, 
                fontSize: 10,
                margin: [0, 5, 0, 0]
              },
              { 
                text: `Điện thoại : ${sdtKhachSan || '1900 1234'}`, 
                fontSize: 10
              },
              { 
                text: `Website : ${website || 'bookinghotel.vn'}`, 
                fontSize: 10
              }
            ]
          }
        ],
        margin: [0, 0, 0, 15]
      },

      // ===== TIÊU ĐỀ =====
      {
        text: 'HÓA ĐƠN THANH TOÁN DỊCH VỤ',
        fontSize: 16,
        bold: true,
        alignment: 'center',
        margin: [0, 10, 0, 15]
      },

      // ===== NGÀY VÀ SỐ HÓA ĐƠN =====
      {
        columns: [
          {
            width: '50%',
            text: [
              { text: ngayLap, fontSize: 11, italics: true }
            ]
          },
          {
            width: '50%',
            text: [
              { text: 'Hóa đơn số : ', fontSize: 11 },
              { text: '#HDDT121TB2004HT25102'||soHoaDon, fontSize: 11, bold: true }
            ],
            alignment: 'right'
          }
        ],
        margin: [0, 0, 0, 15]
      },

      // ===== ĐƯỜNG KẺ =====
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000000' }
        ],
        margin: [0, 0, 0, 15]
      },

      // ===== THÔNG TIN KHÁCH + ĐẶT PHÒNG =====
      {
        columns: [
          // Bên trái - Thông tin khách
          {
            width: '45%',
            table: {
              widths: [60, '*'],
              body: [
                [
                  { text: 'Tên', fontSize: 10, border: [false, false, false, false] },
                  { text: `: ${tenKhachHang || 'Khách hàng'}`, fontSize: 10, bold: true, border: [false, false, false, false] }
                ],
                [
                  { text: 'Điện thoại', fontSize: 10, border: [false, false, false, false] },
                  { text: `: ${sdt || 'N/A'}`, fontSize: 10, border: [false, false, false, false] }
                ],
                [
                  { text: 'Phòng', fontSize: 10, border: [false, false, false, false] },
                  { text: `: ${tenPhong || 'N/A'}`, fontSize: 10, bold: true, border: [false, false, false, false] }
                ]
              ]
            },
            layout: 'noBorders'
          },
          // Bên phải - Thông tin đặt phòng
          {
            width: '55%',
            table: {
              widths: [70, '*'],
              body: [
                [
                  { text: 'Ngày đến', fontSize: 10, border: [false, false, false, false], alignment: 'right' },
                  { text: `: ${formatDateTime(ngayNhan)}`, fontSize: 10, border: [false, false, false, false] }
                ],
                [
                  { text: 'Ngày đi', fontSize: 10, border: [false, false, false, false], alignment: 'right' },
                  { text: `: ${formatDateTime(ngayTra)}`, fontSize: 10, border: [false, false, false, false] }
                ],
                [
                  { text: soGio ? 'Số giờ' : 'Số đêm', fontSize: 10, border: [false, false, false, false], alignment: 'right' },
                  { text: `: ${soLuong}`, fontSize: 10, bold: true, border: [false, false, false, false] }
                ],
                [
                  { text: 'Thanh toán', fontSize: 10, border: [false, false, false, false], alignment: 'right' },
                  { text: `: ${phuongThucThanhToan || 'Tiền mặt'}`, fontSize: 10, border: [false, false, false, false] }
                ]
              ]
            },
            layout: 'noBorders'
          }
        ],
        margin: [0, 0, 0, 15]
      },

      // ===== ĐƯỜNG KẺ =====
      {
        canvas: [
          { type: 'line', x1: 0, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000000' }
        ],
        margin: [0, 0, 0, 10]
      },

      // ===== HEADER BẢNG CHI TIẾT =====
      {
        columns: [
          { text: 'NGÀY', fontSize: 10, bold: true, width: 140 },
          { text: 'CHI TIẾT', fontSize: 10, bold: true, width: '*' },
          { text: 'SỐ TIỀN', fontSize: 10, bold: true, width: 100, alignment: 'right' }
        ],
        margin: [0, 0, 0, 8]
      },

      // ===== CHI TIẾT DỊCH VỤ =====
      ...chiTietDichVu.map(item => ({
        columns: [
          { text: item.ngay, fontSize: 10, width: 140 },
          { text: item.chiTiet, fontSize: 10, width: '*' },
          { 
            text: item.soTien < 0 ? `-${formatCurrency(Math.abs(item.soTien))}` : formatCurrency(item.soTien), 
            fontSize: 10, 
            width: 100, 
            alignment: 'right',
            color: item.soTien < 0 ? '#059669' : '#000000'
          }
        ],
        margin: [0, 3, 0, 3]
      })),

      // ===== ĐƯỜNG KẺ TỔNG =====
      {
        canvas: [
          { type: 'line', x1: 300, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000000' }
        ],
        margin: [0, 10, 0, 5]
      },

      // ===== TỔNG CỘNG =====
      {
        columns: [
          { text: '', width: '*' },
          { text: 'Tổng cộng :', fontSize: 11, bold: true, width: 100, alignment: 'right' },
          { text: formatCurrency(tongCong), fontSize: 12, bold: true, width: 100, alignment: 'right' }
        ],
        margin: [0, 5, 0, 15]
      },

      // ===== ĐƯỜNG KẺ TỔNG (dưới) =====
      {
        canvas: [
          { type: 'line', x1: 300, y1: 0, x2: 515, y2: 0, lineWidth: 1, lineColor: '#000000' }
        ],
        margin: [0, 0, 0, 20]
      },

      // ===== GHI CHÚ VAT =====
      {
        text: 'Đã bao gồm thuế VAT',
        fontSize: 11,
        italics: true,
        color: '#666666',
        margin: [0, 0, 0, 30]
      },

      // ===== CHỮ KÝ =====
      {
        columns: [
          {
            width: '50%',
            stack: [
              { text: 'Đại diện khách sạn', fontSize: 11, bold: true, alignment: 'center' },
              { text: '', margin: [0, 50, 0, 0] },
              { text: 'Lương Thanh Bình', fontSize: 10, alignment: 'center' }
            ]
          },
          {
            width: '50%',
            stack: [
              { text: 'Khách hàng', fontSize: 11, bold: true, alignment: 'center' },
              { text: '', margin: [0, 50, 0, 0] },
              { text: tenKhachHang || '', fontSize: 10, alignment: 'center' }
            ]
          }
        ]
      },

      // ===== FOOTER =====
      {
        text: '--- Cảm ơn quý khách và hẹn gặp lại! ---',
        fontSize: 10,
        italics: true,
        alignment: 'center',
        color: '#999999',
        margin: [0, 40, 0, 0]
      }
    ],

    defaultStyle: {
      font: 'Roboto'
    }
  };

  return new Promise((resolve, reject) => {
    try {
      const pdfDoc = pdfMake.createPdf(docDefinition);
      pdfDoc.getBuffer((buffer) => {
        resolve(buffer);
      });
    } catch (error) {
      console.error('Error generating PDF:', error);
      reject(error);
    }
  });
};

/**
 * Tạo và lưu file PDF
 */
const generateAndSaveInvoice = async (bookingData, outputPath) => {
  const fs = require('fs');
  const path = require('path');
  
  try {
    const buffer = await generateInvoicePDF(bookingData);
    
    const dir = path.dirname(outputPath);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    
    fs.writeFileSync(outputPath, buffer);
    console.log(`Invoice saved to: ${outputPath}`);
    return outputPath;
  } catch (error) {
    console.error('Error saving invoice:', error);
    throw error;
  }
};

module.exports = {
  generateInvoicePDF,
  generateAndSaveInvoice,
  formatCurrency,
  formatDateTime,
  formatDate
};
