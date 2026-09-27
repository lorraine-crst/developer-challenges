import type {
  MonitoringPoint,
  MonitoringPointSortField,
  PaginatedResult,
} from '@dynamox/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, extractErrorMessage } from '../lib/api';

export const PAGE_SIZE = 5;

interface ListParams {
  page: number;
  sortBy: MonitoringPointSortField;
  order: 'asc' | 'desc';
}

interface MonitoringPointsState {
  items: MonitoringPoint[];
  total: number;
  page: number;
  sortBy: MonitoringPointSortField;
  order: 'asc' | 'desc';
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: MonitoringPointsState = {
  items: [],
  total: 0,
  page: 1,
  sortBy: 'pointName',
  order: 'asc',
  status: 'idle',
  error: null,
};

export const fetchMonitoringPoints = createAsyncThunk<
  PaginatedResult<MonitoringPoint>,
  ListParams,
  { rejectValue: string }
>('monitoringPoints/fetchAll', async ({ page, sortBy, order }, { rejectWithValue }) => {
  try {
    const response = await api.get<PaginatedResult<MonitoringPoint>>('/monitoring-points', {
      params: { page, limit: PAGE_SIZE, sortBy, order },
    });

    return response.data;
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

const monitoringPointsSlice = createSlice({
  name: 'monitoringPoints',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchMonitoringPoints.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchMonitoringPoints.fulfilled, (state, action) => {
        state.items = action.payload.items;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.status = 'succeeded';
      })
      .addCase(fetchMonitoringPoints.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load monitoring points';
      });
  },
});

export const monitoringPointsReducer = monitoringPointsSlice.reducer;