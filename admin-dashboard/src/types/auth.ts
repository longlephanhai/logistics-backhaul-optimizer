export interface IPermission {
  _id: string;
  name: string;
  apiPath: string;
  method: 'GET' | 'POST' | 'PATCH' | 'PUT' | 'DELETE';
  module: string;
}

export interface IRole {
  _id: string;
  name: string;
  description?: string;
  isActive?: boolean;
  permissions?: IPermission[] | string[];
}

export interface IUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  address?: string;
  role: {
    _id: string;
    name: string;
  };
  permissions?: IPermission[];
  status?: string;
}

export interface IBackendResponse<T = any> {
  statusCode: number;
  message?: string;
  data: T;
  error?: string;
}

export interface ILoginResponseData {
  access_token: string;
  user: IUser;
}

export interface AuthState {
  user: IUser | null;
  accessToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialLoading: boolean;
  error: string | null;
}
