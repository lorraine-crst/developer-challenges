import type { MachineType, SensorModel } from '@dynamox/types';

const PUMP_RESTRICTED_MODELS: SensorModel[] = ['TcAg', 'TcAs'];

export function isSensorModelRestricted(
  machineType: MachineType,
  model: SensorModel,
): boolean {
  return machineType === 'Bomba' && PUMP_RESTRICTED_MODELS.includes(model);
}