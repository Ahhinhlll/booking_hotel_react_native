// Script to update all management pages with client-side search
// This will be applied to all management pages

const updateManagementPage = (pageName, searchKeys) => {
  return `
// Add these imports to the top of ${pageName}.tsx
import useSearch from '../hooks/useSearch';
import SearchInput from '../components/SearchInput';

// Replace the search state and logic with:
const {
  searchTerm,
  setSearchTerm,
  searchResults,
  clearSearch,
  isSearching
} = useSearch(data, {
  keys: ${JSON.stringify(searchKeys)},
  threshold: 0.3
});

// Replace the search input section with:
<SearchInput
  placeholder="Tìm kiếm..."
  value={searchTerm}
  onChange={setSearchTerm}
  onSearch={() => {}}
  onClear={clearSearch}
  loading={loading}
/>

// Replace dataSource in Table with:
dataSource={searchResults}
`;
};

// Configuration for each page
const pageConfigs = {
  'UserManagement': ['hoTen', 'email', 'sdt', 'diaChi'],
  'HotelManagement': ['tenKS', 'diaChi', 'tinhThanh', 'sdt'],
  'RoomManagement': ['tenPhong', 'moTa'],
  'LoaiPhongManagement': ['tenLoaiPhong', 'moTa'],
  'GiaPhongManagement': ['loaiDat'],
  'BookingManagement': ['maDatPhong', 'trangThai'],
  'PromotionManagement': ['tenKM', 'thongTinKM'],
  'DanhGiaManagement': ['binhLuan']
};

console.log('Page configurations:', pageConfigs);
