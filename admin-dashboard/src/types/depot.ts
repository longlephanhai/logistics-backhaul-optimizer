export enum DepotStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
}

export interface IDepotLocation {
  type: 'Point';
  coordinates: [number, number]; // [lng, lat]
}

export interface IDepot {
  _id: string;
  name: string;
  address: string;
  location: IDepotLocation;
  capacityTrucks: number;
  status: DepotStatus;
  contactPhone?: string;
  contactPerson?: string;
  createdBy?: {
    _id: string;
    email: string;
  };
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateDepotPayload {
  name: string;
  address: string;
  location: {
    type?: string;
    coordinates: [number, number];
  };
  capacityTrucks: number;
  status?: DepotStatus;
  contactPhone?: string;
  contactPerson?: string;
}

export type UpdateDepotPayload = Partial<CreateDepotPayload>;
