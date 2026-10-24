import { apiClient, setAccessToken } from './apiClient';
import type { IBackendResponse, ILoginResponseData, IUser } from '@/types/auth';

export interface LoginDto {
  email: string;
  password: string;
  username?: string;
}

export const authService = {
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


  getAccount: async (): Promise<{ user: IUser }> => {
    const res = await apiClient.get<any, IBackendResponse<{ user: IUser }>>('/auth/account');
    return res.data;
  },


  refreshToken: async (): Promise<ILoginResponseData> => {
    const res = await apiClient.get<any, IBackendResponse<ILoginResponseData>>('/auth/refresh');
    const data = res.data;
    if (data?.access_token) {
      setAccessToken(data.access_token);
    }
    return data;
  },


  logout: async (): Promise<void> => {
    try {
      await apiClient.post('/auth/logout');
    } finally {
      setAccessToken(null);
    }
  },
};
