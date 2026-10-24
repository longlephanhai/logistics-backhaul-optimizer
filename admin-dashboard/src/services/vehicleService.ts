import { apiClient } from './apiClient';
import type { IBackendResponse } from '@/types/auth';
import type { PaginatedResponse } from './userService';
import type { IVehicle, CreateVehiclePayload, UpdateVehiclePayload } from '@/types/vehicle';

export const vehicleService = {
  getVehicles: async (
    current = 1,
    pageSize = 10,
    search = '',
    status = '',
    vehicleType = '',
    currentDepot = ''
  ): Promise<PaginatedResponse<IVehicle>> => {
    let url = `/vehicles?current=${current}&pageSize=${pageSize}&sort=-createdAt`;
    if (search) {
      url += `&plateNumber=/${search}/i`;
    }
    if (status && status !== 'ALL') {
      url += `&status=${status}`;
    }
    if (vehicleType && vehicleType !== 'ALL') {
      url += `&vehicleType=${vehicleType}`;
    }
    if (currentDepot && currentDepot !== 'ALL') {
      url += `&currentDepot=${currentDepot}`;
    }
    const res = await apiClient.get<any, IBackendResponse<PaginatedResponse<IVehicle>>>(url);
    return res.data;
  },

  getAllVehicles: async (): Promise<IVehicle[]> => {
    const res = await apiClient.get<any, IBackendResponse<PaginatedResponse<IVehicle>>>(
      '/vehicles?current=1&pageSize=500'
    );
    return res.data?.result || [];
  },

  getVehiclesByDepot: async (depotId: string): Promise<IVehicle[]> => {
    const res = await apiClient.get<any, IBackendResponse<PaginatedResponse<IVehicle>>>(
      `/vehicles?currentDepot=${depotId}&pageSize=100`
    );
    return res.data?.result || [];
  },

  getVehicleById: async (id: string): Promise<IVehicle> => {
    const res = await apiClient.get<any, IBackendResponse<IVehicle>>(`/vehicles/${id}`);
    return res.data;
  },

  createVehicle: async (payload: CreateVehiclePayload): Promise<IVehicle> => {
    const res = await apiClient.post<any, IBackendResponse<IVehicle>>('/vehicles', payload);
    return res.data;
  },

  updateVehicle: async (id: string, payload: UpdateVehiclePayload): Promise<any> => {
    const res = await apiClient.patch<any, IBackendResponse<any>>(`/vehicles/${id}`, payload);
    return res.data;
  },

  deleteVehicle: async (id: string): Promise<any> => {
    const res = await apiClient.delete<any, IBackendResponse<any>>(`/vehicles/${id}`);
    return res.data;
  },
};
