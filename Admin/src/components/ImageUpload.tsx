import { useState, useEffect } from 'react';
import { Upload, message } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { uploadService } from '../services/uploadService';

interface ImageUploadProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  maxCount?: number;
}

const ImageUpload = ({ value = [], onChange, maxCount = 5 }: ImageUploadProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>(
    (Array.isArray(value) ? value : []).map((url, index) => ({
      uid: `${index}`,
      name: `image-${index}`,
      status: 'done',
      url: url.startsWith('/uploads/') ? uploadService.getImageUrl(url) : uploadService.getImageUrl(`/uploads/${url}`),
    }))
  );
  const [, setUploading] = useState(false);

  // Update fileList when value prop changes
  useEffect(() => {
    const newFileList = (Array.isArray(value) ? value : []).map((url, index) => ({
      uid: `${index}`,
      name: `image-${index}`,
      status: 'done' as const,
      url: url.startsWith('/uploads/') ? uploadService.getImageUrl(url) : uploadService.getImageUrl(`/uploads/${url}`),
    }));
    setFileList(newFileList);
  }, [value]);

  const handleUpload: UploadProps['customRequest'] = async (options) => {
    const { file, onSuccess, onError } = options;
    setUploading(true);

    try {
      const imageUrl = await uploadService.uploadImage(file as File);
      const newFileList = [
        ...fileList,
        {
          uid: Date.now().toString(),
          name: (file as File).name,
          status: 'done' as const,
          url: uploadService.getImageUrl(imageUrl),
        },
      ];

      setFileList(newFileList);
      const urls = newFileList.map((f) => {
        // Extract path from URL - handle both full URLs and relative paths
        if (f.url?.includes('/uploads/')) {
          // If it's a full URL, extract the path part
          if (f.url.startsWith('http')) {
            return f.url.split('/uploads/')[1];
          }
          // If it's already a relative path starting with /uploads/, keep it as is
          return f.url;
        }
        return f.url || '';
      });
      onChange?.(urls);

      message.success('Upload ảnh thành công!');
      onSuccess?.('ok');
    } catch (error) {
      message.error('Upload ảnh thất bại!');
      onError?.(error as Error);
    } finally {
      setUploading(false);
    }
  };

  const handleRemove = (file: UploadFile) => {
    const newFileList = fileList.filter((f) => f.uid !== file.uid);
    setFileList(newFileList);
    const urls = newFileList.map((f) => {
      // Extract path from URL - handle both full URLs and relative paths
      if (f.url?.includes('/uploads/')) {
        // If it's a full URL, extract the path part
        if (f.url.startsWith('http')) {
          return f.url.split('/uploads/')[1];
        }
        // If it's already a relative path starting with /uploads/, keep it as is
        return f.url;
      }
      return f.url || '';
    });
    onChange?.(urls);
  };

  const uploadButton = (
    <div>
      <PlusOutlined />
      <div style={{ marginTop: 8 }}>Upload</div>
    </div>
  );

  return (
    <Upload
      listType="picture-card"
      fileList={fileList}
      customRequest={handleUpload}
      onRemove={handleRemove}
      accept="image/*"
      maxCount={maxCount}
    >
      {fileList.length >= maxCount ? null : uploadButton}
    </Upload>
  );
};

export default ImageUpload;

