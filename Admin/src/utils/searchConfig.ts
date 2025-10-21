// Quick update script for remaining management pages
// This will update all remaining pages with client-side search

const updateRemainingPages = () => {
  const pages = [
    {
      name: 'HotelManagement',
      keys: ['tenKS', 'diaChi', 'tinhThanh', 'dienThoai'],
      placeholder: 'Tìm kiếm khách sạn...'
    },
    {
      name: 'LoaiPhongManagement', 
      keys: ['tenLoaiPhong', 'moTa'],
      placeholder: 'Tìm kiếm loại phòng...'
    },
    {
      name: 'GiaPhongManagement',
      keys: ['loaiDat'],
      placeholder: 'Tìm kiếm giá phòng...'
    },
    {
      name: 'BookingManagement',
      keys: ['maDatPhong', 'trangThai'],
      placeholder: 'Tìm kiếm đặt phòng...'
    },
    {
      name: 'PromotionManagement',
      keys: ['tenKM', 'thongTinKM'],
      placeholder: 'Tìm kiếm khuyến mãi...'
    },
    {
      name: 'DanhGiaManagement',
      keys: ['binhLuan'],
      placeholder: 'Tìm kiếm đánh giá...'
    }
  ];

  return pages;
};

export default updateRemainingPages;
