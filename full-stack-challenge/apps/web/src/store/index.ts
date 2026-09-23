import { configureStore } from '@reduxjs/toolkit';
import { authReducer } from './authSlice';
import { machinesReducer } from './machineSlice';
import { monitoringPointsReducer } from './monitoringPointsSlice';
import { readingsReducer } from './readingsSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    machines: machinesReducer,
    monitoringPoints: monitoringPointsReducer,
    readings: readingsReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;