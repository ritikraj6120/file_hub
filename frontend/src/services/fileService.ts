import axios from 'axios';
import { FileType, StorageMetadata } from '../types/file';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api';

interface GetFilesParams {
  page?: number;
  pageSize?: number;
  search?: string;
  fileType?: string;
  minSize?: number;
  maxSize?: number;
  uploadDate?: string;
}

interface PaginatedResponse<T> {
  results: T[];
  total: number;
  pages: number;
  current_page: number;
}

export const fileService = {
  async uploadFile(file: File): Promise<{data: FileType; status: number}> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axios.post(`${API_URL}/files/`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return {
      data: response.data,
      status: response.status
    };
  },

  async getFiles(params: GetFilesParams = {}): Promise<PaginatedResponse<FileType>> {
    const queryParams = new URLSearchParams();
    
    if (params.page) queryParams.append('page', params.page.toString());
    if (params.pageSize) queryParams.append('page_size', params.pageSize.toString());
    if (params.search) queryParams.append('search', params.search);
    if (params.fileType) queryParams.append('file_type', params.fileType);
    if (params.minSize) queryParams.append('min_size', params.minSize.toString());
    if (params.maxSize) queryParams.append('max_size', params.maxSize.toString());
    if (params.uploadDate) queryParams.append('upload_date', params.uploadDate);

    const response = await axios.get(`${API_URL}/files/?${queryParams.toString()}`);
    return response.data;
  },

  async deleteFile(id: string): Promise<void> {
    await axios.delete(`${API_URL}/files/${id}/`);
  },

  async downloadFile(fileUrl: string, filename: string): Promise<void> {
    try {
      const response = await axios.get(fileUrl, {
        responseType: 'blob',
      });
      
      // Create a blob URL and trigger download
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      throw new Error('Failed to download file');
    }
  },
  async getStorageStats(): Promise<StorageMetadata> {
    const response = await axios.get(`${API_URL}/storage-metadata/1/`);
    return response.data;
  },
};