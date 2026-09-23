import type { Machine } from '@dynamox/types';
import { describe, expect, it } from 'vitest';
import { createMachine, deleteMachine, machinesReducer, updateMachine } from './machineSlice';

const initialState = {
  items: [] as Machine[],
  status: 'idle' as const,
  error: null,
};

const machineA: Machine = {
  id: 'machine-1',
  name: 'Bomba Centrifuga 01',
  type: 'Bomba',
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-01T00:00:00.000Z',
};

const machineB: Machine = {
  id: 'machine-2',
  name: 'Ventilador Industrial A',
  type: 'Ventilador',
  createdAt: '2026-01-02T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
};

describe('machinesReducer', () => {
  it('inserts a new machine at the top of the list on createMachine.fulfilled', () => {
    const stateWithOne = { ...initialState, items: [machineA] };

    const action = createMachine.fulfilled(machineB, 'request-1', {
      name: machineB.name,
      type: machineB.type,
    });
    const state = machinesReducer(stateWithOne, action);

    expect(state.items).toHaveLength(2);
    expect(state.items[0]).toEqual(machineB);
  });

  it('replaces the matching machine on updateMachine.fulfilled', () => {
    const stateWithBoth = { ...initialState, items: [machineA, machineB] };
    const updatedMachineA: Machine = { ...machineA, name: 'Bomba Renomeada' };

    const action = updateMachine.fulfilled(updatedMachineA, 'request-1', {
      id: machineA.id,
      input: { name: updatedMachineA.name, type: machineA.type },
    });
    const state = machinesReducer(stateWithBoth, action);

    expect(state.items[0].name).toBe('Bomba Renomeada');
    expect(state.items[1]).toEqual(machineB);
  });

  it('removes the matching machine on deleteMachine.fulfilled', () => {
    const stateWithBoth = { ...initialState, items: [machineA, machineB] };

    const action = deleteMachine.fulfilled(machineA.id, 'request-1', machineA.id);
    const state = machinesReducer(stateWithBoth, action);

    expect(state.items).toHaveLength(1);
    expect(state.items[0]).toEqual(machineB);
  });
});