import { apiClient } from './apiClient';
import type { IBackendResponse } from '@/types/auth';
import type { PaginatedResponse } from './userService';
import type { IDepot, CreateDepotPayload, UpdateDepotPayload } from '@/types/depot';

export const depotService = {
  getDepots: async (
    current = 1,
    pageSize = 10,
    search = '',
    status = ''
  ): Promise<PaginatedResponse<IDepot>> => {
    let url = `/depots?current=${current}&pageSize=${pageSize}&sort=-createdAt`;
    if (search) {
      url += `&name=/${search}/i`;
    }
    if (status && status !== 'ALL') {
      url += `&status=${status}`;
    }
    const res = await apiClient.get<any, IBackendResponse<PaginatedResponse<IDepot>>>(url);
    return res.data;
  },

  getAllDepotsSimple: async (): Promise<IDepot[]> => {
    const res = await apiClient.get<any, IBackendResponse<PaginatedResponse<IDepot>>>(
      '/depots?current=1&pageSize=100&status=ACTIVE'
    );
    return res.data?.result || [];
  },

  getDepotById: async (id: string): Promise<IDepot> => {
    const res = await apiClient.get<any, IBackendResponse<IDepot>>(`/depots/${id}`);
    return res.data;
  },

  createDepot: async (payload: CreateDepotPayload): Promise<IDepot> => {
    const res = await apiClient.post<any, IBackendResponse<IDepot>>('/depots', payload);
    return res.data;
  },

  updateDepot: async (id: string, payload: UpdateDepotPayload): Promise<any> => {
    const res = await apiClient.patch<any, IBackendResponse<any>>(`/depots/${id}`, payload);
    return res.data;
  },

  deleteDepot: async (id: string): Promise<any> => {
    const res = await apiClient.delete<any, IBackendResponse<any>>(`/depots/${id}`);
    return res.data;
  },
};
