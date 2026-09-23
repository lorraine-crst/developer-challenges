import { Route, Routes } from 'react-router-dom';
import AppLayout from './components/AppLayout';
import PrivateRoute from './components/PrivateRoute';
import DashboardPage from './pages/DashboardPage';
import LoginPage from './pages/LoginPage';
import MachinesPage from './pages/MachinesPage';
import MonitoringPointsPage from './pages/MonitoringPointsPage';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />

      <Route element={<PrivateRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/machines" element={<MachinesPage />} />
          <Route path="/monitoring-points" element={<MonitoringPointsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}