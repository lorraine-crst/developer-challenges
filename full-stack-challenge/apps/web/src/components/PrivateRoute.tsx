import { Box, CircularProgress } from '@mui/material';
import { useEffect } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { restoreSession } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

export default function PrivateRoute() {
  const dispatch = useAppDispatch();
  const status = useAppSelector((state) => state.auth.status);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(restoreSession());
    }
  }, [status, dispatch]);

  if (status === 'idle' || status === 'loading') {
    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

  if (status === 'unauthenticated') {
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}