import { apiClient } from './apiClient';
import type { IBackendResponse, IRole } from '@/types/auth';
import type { PaginatedResponse } from './userService';

export interface CreateRolePayload {
  name: string;
  description: string;
  isActive: boolean;
  permissions: string[];
}

export const roleService = {
  getRoles: async (current = 1, pageSize = 20): Promise<PaginatedResponse<IRole>> => {
    const res = await apiClient.get<any, IBackendResponse<PaginatedResponse<IRole>>>(
      `/roles?current=${current}&pageSize=${pageSize}&populate=permissions`
    );
    return res.data;
  },

  getRoleById: async (id: string): Promise<IRole> => {
    const res = await apiClient.get<any, IBackendResponse<IRole>>(`/roles/${id}`);
    return res.data;
  },

  createRole: async (payload: CreateRolePayload): Promise<IRole> => {
    const res = await apiClient.post<any, IBackendResponse<IRole>>('/roles', payload);
    return res.data;
  },

  updateRole: async (id: string, payload: Partial<CreateRolePayload>): Promise<any> => {
    const res = await apiClient.patch<any, IBackendResponse<any>>(`/roles/${id}`, payload);
    return res.data;
  },

  deleteRole: async (id: string): Promise<any> => {
    const res = await apiClient.delete<any, IBackendResponse<any>>(`/roles/${id}`);
    return res.data;
  },
};
