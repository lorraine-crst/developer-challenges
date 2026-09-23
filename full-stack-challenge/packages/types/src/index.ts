export type MachineType = 'Bomba' | 'Ventilador';

export type SensorModel = 'TcAg' | 'TcAs' | 'HF+';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  createdAt: string;
  updatedAt: string;
}

export interface Sensor {
  id: string;
  serialNumber: string;
  model: SensorModel;
  monitoringPointId: string;
  createdAt: string;
  updatedAt: string;
}

export interface MonitoringPoint {
  id: string;
  name: string;
  machineId: string;
  machine: Machine;
  sensor: Sensor | null;
  createdAt: string;
  updatedAt: string;
}

export interface PaginatedResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
}

export type MonitoringPointSortField = 'machineName' | 'machineType' | 'pointName' | 'sensorModel';

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