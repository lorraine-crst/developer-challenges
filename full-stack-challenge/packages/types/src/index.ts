export type MachineType = 'Bomba' | 'Ventilador';

export type SensorModel = 'TcAg' | 'TcAs' | 'HF+';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  createdAt: string;
  updatedAt: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: User;
}

export interface ApiErrorResponse {
  error: string;
  details?: Array<{ field: string; message: string }>;
}