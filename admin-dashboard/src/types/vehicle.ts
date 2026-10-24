export enum VehicleType {
  CLOSED_BOX = 'CLOSED_BOX', // Thùng kín
  TARPAULIN = 'TARPAULIN', // Thùng mui bạt
  REFRIGERATED = 'REFRIGERATED', // Thùng đông lạnh/mát
  FLATBED = 'FLATBED', // Sàn phẳng / container
}

export enum VehicleStatus {
  IDLE = 'IDLE', // Xe rảnh, sẵn sàng nhận ghép đơn
  IN_TRANSIT = 'IN_TRANSIT', // Đang trên lộ trình vận chuyển
  MAINTENANCE = 'MAINTENANCE', // Đang bảo dưỡng kỹ thuật
}

export interface IVehicleLocation {
  type: string;
  coordinates: [number, number]; // [lng, lat]
}

export interface IVehicleUserRef {
  _id: string;
  name: string;
  email: string;
  phone?: string;
}

export interface IVehicleDepotRef {
  _id: string;
  name: string;
  address: string;
  location?: {
    coordinates: [number, number];
  };
}

export interface IVehicle {
  _id: string;
  plateNumber: string;
  modelName?: string;
  owner: IVehicleUserRef | string;
  driver?: IVehicleUserRef | string | null;
  vehicleType: VehicleType;
  maxWeightKg: number;
  maxVolumeCbm: number;
  lengthM: number;
  widthM: number;
  heightM: number;
  fuelEmptyRate: number;
  fuelFullRate: number;
  costPerKm: number;
  status: VehicleStatus;
  currentLocation?: IVehicleLocation;
  currentDepot?: IVehicleDepotRef | string | null;
  rating: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateVehiclePayload {
  plateNumber: string;
  modelName?: string;
  owner: string;
  driver?: string;
  vehicleType: VehicleType;
  maxWeightKg: number;
  maxVolumeCbm: number;
  lengthM?: number;
  widthM?: number;
  heightM?: number;
  fuelEmptyRate: number;
  fuelFullRate: number;
  costPerKm: number;
  status?: VehicleStatus;
  currentLocation?: {
    type?: string;
    coordinates: [number, number];
  };
  currentDepot?: string;
  rating?: number;
}

export type UpdateVehiclePayload = Partial<CreateVehiclePayload>;
