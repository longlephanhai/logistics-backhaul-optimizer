import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';
import type { IBackendResponse, ILoginResponseData } from '@/types/auth';


let currentAccessToken: string | null = localStorage.getItem('access_token');

export const setAccessToken = (token: string | null) => {
  currentAccessToken = token;
  if (token) {
    localStorage.setItem('access_token', token);
  } else {
    localStorage.removeItem('access_token');
  }
};

export const getAccessToken = (): string | null => {
  return currentAccessToken;
};


export const apiClient = axios.create({
  baseURL: '/api/v1',
  withCredentials: true, 
  headers: {
    'Content-Type': 'application/json',
  },
});


let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value?: any) => void;
  reject: (reason?: any) => void;
}> = [];

const processQueue = (error: any, token: string | null = null) => {
  failedQueue.forEach((promise) => {
    if (error) {
      promise.reject(error);
    } else {
      promise.resolve(token);
    }
  });
  failedQueue = [];
};


apiClient.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = getAccessToken();
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);


apiClient.interceptors.response.use(
  (response) => {
    return response.data;
  },
  async (error: AxiosError<IBackendResponse>) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (!error.response) {
      window.dispatchEvent(new Event('app:server_error'));
      return Promise.reject(new Error('Không thể kết nối đến máy chủ Backend (Port 8080). Vui lòng thử lại!'));
    }

    const { status, config } = error.response;
    const requestUrl = config.url || '';

    if (status === 403) {
      window.dispatchEvent(new Event('app:forbidden'));
    }

    if (status >= 500) {
      window.dispatchEvent(new Event('app:server_error'));
    }

    const isAuthEndpoint = requestUrl.includes('/auth/login') || requestUrl.includes('/auth/refresh');

    if (status === 401 && !isAuthEndpoint && !originalRequest._retry) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((newToken) => {
            if (originalRequest.headers) {
              originalRequest.headers.Authorization = `Bearer ${newToken}`;
            }
            return apiClient(originalRequest);
          })
          .catch((err) => {
            return Promise.reject(err);
          });
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        const refreshResponse = await axios.get<IBackendResponse<ILoginResponseData>>(
          '/api/v1/auth/refresh',
          {
            withCredentials: true,
          }
        );

        const newAccessToken = refreshResponse.data.data?.access_token;

        if (newAccessToken) {
          setAccessToken(newAccessToken);
          processQueue(null, newAccessToken);

          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
          }
          return apiClient(originalRequest);
        } else {
          throw new Error('Refresh token không trả về access token mới.');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        setAccessToken(null);
        window.dispatchEvent(new Event('auth:unauthorized'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }
    const errorMessage = error.response.data?.message || error.message || 'Đã có lỗi xảy ra';
    return Promise.reject(new Error(Array.isArray(errorMessage) ? errorMessage.join(', ') : errorMessage));
  }
);
