import { apiClient } from './apiClient';
import type { IBackendResponse, IUser } from '@/types/auth';

export interface PaginatedResponse<T> {
  meta: {
    current: number;
    pageSize: number;
    pages: number;
    total: number;
  };
  result: T[];
}

export interface CreateUserPayload {
  name: string;
  email: string;
  password?: string;
  phone?: string;
  address?: string;
  role: string;
}

export const userService = {
  getUsers: async (current = 1, pageSize = 10, search = ''): Promise<PaginatedResponse<IUser>> => {
    let url = `/users?current=${current}&pageSize=${pageSize}&populate=role`;
    if (search) {
      url += `&name=/${search}/i`;
    }
    const res = await apiClient.get<any, IBackendResponse<PaginatedResponse<IUser>>>(url);
    return res.data;
  },

  getUserById: async (id: string): Promise<IUser> => {
    const res = await apiClient.get<any, IBackendResponse<IUser>>(`/users/${id}`);
    return res.data;
  },

  createUser: async (payload: CreateUserPayload): Promise<IUser> => {
    const res = await apiClient.post<any, IBackendResponse<IUser>>('/users', payload);
    return res.data;
  },

  updateUser: async (id: string, payload: Partial<CreateUserPayload>): Promise<any> => {
    const res = await apiClient.patch<any, IBackendResponse<any>>(`/users/${id}`, payload);
    return res.data;
  },

  deleteUser: async (id: string): Promise<any> => {
    const res = await apiClient.delete<any, IBackendResponse<any>>(`/users/${id}`);
    return res.data;
  },
};
