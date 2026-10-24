import { apiClient } from './apiClient';
import type { IBackendResponse, IPermission } from '@/types/auth';
import type { PaginatedResponse } from './userService';

export interface CreatePermissionPayload {
  name: string;
  apiPath: string;
  method: string;
  module: string;
}

export const permissionService = {
  getPermissions: async (current = 1, pageSize = 100): Promise<PaginatedResponse<IPermission>> => {
    const res = await apiClient.get<any, IBackendResponse<PaginatedResponse<IPermission>>>(
      `/permissions?current=${current}&pageSize=${pageSize}`
    );
    return res.data;
  },

  createPermission: async (payload: CreatePermissionPayload): Promise<IPermission> => {
    const res = await apiClient.post<any, IBackendResponse<IPermission>>('/permissions', payload);
    return res.data;
  },

  updatePermission: async (id: string, payload: Partial<CreatePermissionPayload>): Promise<any> => {
    const res = await apiClient.patch<any, IBackendResponse<any>>(`/permissions/${id}`, payload);
    return res.data;
  },

  deletePermission: async (id: string): Promise<any> => {
    const res = await apiClient.delete<any, IBackendResponse<any>>(`/permissions/${id}`);
    return res.data;
  },
};
