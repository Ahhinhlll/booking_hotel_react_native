import { useState } from 'react';
import { Upload, message, Image } from 'antd';
import { PlusOutlined, DeleteOutlined } from '@ant-design/icons';
import type { UploadFile, UploadProps } from 'antd';
import { uploadService } from '../services/uploadService';

interface ImageUploadProps {
  value?: string[];
  onChange?: (value: string[]) => void;
  maxCount?: number;
}

const ImageUpload = ({ value = [], onChange, maxCount = 5 }: ImageUploadProps) => {
  const [fileList, setFileList] = useState<UploadFile[]>(
    value.map((url, index) => ({
      uid: `${index}`,
      name: `image-${index}`,
      status: 'done',
      url: uploadService.getImageUrl(url),
    }))
  );
  const [uploading, setUploading] = useState(false);

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
        // Extract path from URL
        if (f.url?.includes('/uploads/')) {
          return f.url.split('/uploads/')[1];
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
      if (f.url?.includes('/uploads/')) {
        return f.url.split('/uploads/')[1];
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

