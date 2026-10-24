import { apiClient, setAccessToken } from './apiClient';
import type { IBackendResponse, ILoginResponseData, IUser } from '@/types/auth';

export interface LoginDto {
  email: string;
  password: string;
  username?: string;
}

export const authService = {
  /**
   * Đăng nhập người dùng bằng Email/Password
   */
  login: async (credentials: LoginDto): Promise<ILoginResponseData> => {
    const res = await apiClient.post<any, IBackendResponse<ILoginResponseData>>(
      '/auth/login',
      credentials
    );
    const data = res.data;
    if (data?.access_token) {
      setAccessToken(data.access_token);
    }
    return data;
  },

  /**
   * Lấy thông tin tài khoản hiện tại kèm danh sách quyền hạn (Permissions)
   */
  getAccount: async (): Promise<{ user: IUser }> => {
    const res = await apiClient.get<any, IBackendResponse<{ user: IUser }>>('/auth/account');
    return res.data;
  },

  /**
   * Làm mới Access Token thông qua Cookie Refresh Token
   */
  refreshToken: async (): Promise<ILoginResponseData> => {
    const res = await apiClient.get<any, IBackendResponse<ILoginResponseData>>('/auth/refresh');
    const data = res.data;
    if (data?.access_token) {
      setAccessToken(data.access_token);
    }
    return data;
  },

  /**
   * Đăng xuất hệ thống và dọn dẹp Cookie/Token
   */
  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },
};
