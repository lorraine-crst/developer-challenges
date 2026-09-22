import type { Machine, MachineType } from '@dynamox/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, extractErrorMessage } from '../lib/api';

interface MachineInput {
  name: string;
  type: MachineType;
}

interface MachinesState {
  items: Machine[];
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MachinesState = {
  items: [],
  status: 'idle',
  error: null,
};

export const fetchMachines = createAsyncThunk<Machine[], void, { rejectValue: string }>(
  'machines/fetchAll',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get<Machine[]>('/machines');

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const createMachine = createAsyncThunk<Machine, MachineInput, { rejectValue: string }>(
  'machines/create',
  async (input, { rejectWithValue }) => {
    try {
      const response = await api.post<Machine>('/machines', input);

      return response.data;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

export const updateMachine = createAsyncThunk<
  Machine,
  { id: string; input: MachineInput },
  { rejectValue: string }
>('machines/update', async ({ id, input }, { rejectWithValue }) => {
  try {
    const response = await api.put<Machine>(`/machines/${id}`, input);

    return response.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const deleteMachine = createAsyncThunk<string, string, { rejectValue: string }>(
  'machines/delete',
  async (id, { rejectWithValue }) => {
    try {
      await api.delete(`/machines/${id}`);

      return id;
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const machinesSlice = createSlice({
  name: 'machines',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMachines.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMachines.fulfilled, (state, action) => {
        state.items = action.payload;
        state.status = 'succeeded';
      })
      .addCase(fetchMachines.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load machines';
      })
      .addCase(createMachine.fulfilled, (state, action) => {
        state.items.unshift(action.payload);
      })
      .addCase(updateMachine.fulfilled, (state, action) => {
        const index = state.items.findIndex((m) => m.id === action.payload.id);

        if (index !== -1) {
          state.items[index] = action.payload;
        }
      })
      .addCase(deleteMachine.fulfilled, (state, action) => {
        state.items = state.items.filter((m) => m.id !== action.payload);
      });
  },
});

export const machinesReducer = machinesSlice.reducer;