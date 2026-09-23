import type { Reading, ReadingMetrics } from '@dynamox/types';
import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { api, extractErrorMessage } from '../lib/api';

interface FetchReadingsArgs {
  monitoringPointId: string;
  seriesName: string;
}

interface DeleteReadingsArgs {
  monitoringPointId: string;
  seriesName: string;
}

interface ReadingsState {
  items: Reading[];
  metrics: ReadingMetrics | null;
  activeSeriesName: string | null;
  status: 'idle' | 'loading' | 'succeeded' | 'failed';
  error: string | null;
}

const initialState: ReadingsState = {
  items: [],
  metrics: null,
  activeSeriesName: null,
  status: 'idle',
  error: null,
};

export const fetchReadings = createAsyncThunk<
  { readings: Reading[]; metrics: ReadingMetrics; seriesName: string },
  FetchReadingsArgs,
  { rejectValue: string }
>('readings/fetchAll', async ({ monitoringPointId, seriesName }, { rejectWithValue }) => {
  try {
    const [readingsResponse, metricsResponse] = await Promise.all([
      api.get<Reading[]>(`/monitoring-points/${monitoringPointId}/readings`, {
        params: { seriesName },
      }),
      api.get<ReadingMetrics>(`/monitoring-points/${monitoringPointId}/readings/metrics`, {
        params: { seriesName },
      }),
    ]);

    return {
      readings: readingsResponse.data,
      metrics: metricsResponse.data,
      seriesName,
    };
  } catch (error) {
    return rejectWithValue(extractErrorMessage(error));
  }
});

export const deleteReadings = createAsyncThunk<void, DeleteReadingsArgs, { rejectValue: string }>(
  'readings/delete',
  async ({ monitoringPointId, seriesName }, { rejectWithValue }) => {
    try {
      await api.delete(`/monitoring-points/${monitoringPointId}/readings`, {
        params: { seriesName },
      });
    } catch (error) {
      return rejectWithValue(extractErrorMessage(error));
    }
  },
);

const readingsSlice = createSlice({
  name: 'readings',
  initialState,
  reducers: {
    clearReadings: (state) => {
      state.items = [];
      state.metrics = null;
      state.activeSeriesName = null;
      state.status = 'idle';
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchReadings.pending, (state) => {
        state.status = 'loading';
        state.error = null;
      })
      .addCase(fetchReadings.fulfilled, (state, action) => {
        state.items = action.payload.readings;
        state.metrics = action.payload.metrics;
        state.activeSeriesName = action.payload.seriesName;
        state.status = 'succeeded';
      })
      .addCase(fetchReadings.rejected, (state, action) => {
        state.status = 'failed';
        state.error = action.payload ?? 'Failed to load readings';
      })
      .addCase(deleteReadings.fulfilled, (state) => {
        state.items = [];
        state.metrics = null;
      });
  },
});

export const { clearReadings } = readingsSlice.actions;
export const readingsReducer = readingsSlice.reducer;