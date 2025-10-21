import { Input, Button, Space } from 'antd';
import { SearchOutlined, ClearOutlined } from '@ant-design/icons';

interface SearchInputProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  onSearch: () => void;
  onClear: () => void;
  loading?: boolean;
  style?: React.CSSProperties;
}

const SearchInput = ({
  placeholder = "Tìm kiếm...",
  value,
  onChange,
  onSearch,
  onClear,
  loading = false,
  style = { width: 300 }
}: SearchInputProps) => {
  return (
    <Space style={{ marginBottom: 16 }}>
      <Input
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onPressEnter={onSearch}
        style={style}
        allowClear
        onClear={onClear}
      />
      <Button 
        icon={<SearchOutlined />} 
        onClick={onSearch}
        loading={loading}
      >
        Tìm kiếm
      </Button>
      {value && (
        <Button 
          icon={<ClearOutlined />} 
          onClick={onClear}
        >
          Xóa
        </Button>
      )}
    </Space>
  );
};

export default SearchInput;
