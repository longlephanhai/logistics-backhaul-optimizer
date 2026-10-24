export enum UserStatus {
    ACTIVE = 'ACTIVE',
    INACTIVE = 'INACTIVE',
    BLOCKED = 'BLOCKED',
    PENDING_APPROVAL = 'PENDING_APPROVAL',
}

export enum DriverStatus {
    OFF_DUTY = 'OFF_DUTY',
    IDLE = 'IDLE',
    ON_DUTY = 'ON_DUTY',
}

export interface IUser {
    _id: string;
    name: string;
    email: string;
    role: {
        _id: string;
        name: string;
    };
    permissions?: {
        _id: string;
        name: string;
        apiPath: string;
        module: string;
    }[]
}