import request from '../utils/request';

export const uploadService = {
  uploadImage: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('image', file);

    const response = await request.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    // Response format: { imageUrl: string, imageUrls: string[] }
    return response.data.imageUrl || response.data.imageUrls?.[0] || response.data;
  },

  getAllImages: async (): Promise<string[]> => {
    const response = await request.get('/images');
    return response.data;
  },

  getImageUrl: (imagePath: string): string => {
    if (!imagePath) return '';
    if (imagePath.startsWith('http')) return imagePath;
    return `http://localhost:3333${imagePath}`;
  },
};

