import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Skeleton,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import PageHeader from '../components/PageHeader';
import { api } from '../lib/api';
import { fetchMachines } from '../store/machineSlice';
import { fetchMonitoringPoints } from '../store/monitoringPointsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const LATENCY_LIMIT_MS = 350;

interface LatencyMeasurement {
  clientMs: number;
  serverMs: number | null;
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { items: machines, status: machinesStatus } = useAppSelector((state) => state.machines);
  const { total: pointsTotal, status: pointsStatus } = useAppSelector(
    (state) => state.monitoringPoints,
  );

  const [measuring, setMeasuring] = useState(false);
  const [latency, setLatency] = useState<LatencyMeasurement | null>(null);

  useEffect(() => {
    if (machines.length === 0) {
      void dispatch(fetchMachines());
    }
  }, [machines.length, dispatch]);

  useEffect(() => {
    void dispatch(fetchMonitoringPoints({ page: 1, sortBy: 'pointName', order: 'asc' }));
  }, [dispatch]);

  async function measureLatency() {
    setMeasuring(true);

    const start = performance.now();

    try {
      const response = await api.get('/auth/me');
      const clientMs = performance.now() - start;
      const serverHeader = response.headers['x-response-time'];
      const serverMs = serverHeader ? parseFloat(serverHeader) : null;

      setLatency({ clientMs, serverMs });
    } catch {
      setLatency(null);
    } finally {
      setMeasuring(false);
    }
  }

  useEffect(() => {
    void measureLatency();
  }, []);

  const bombaCount = machines.filter((machine) => machine.type === 'Bomba').length;
  const ventiladorCount = machines.filter((machine) => machine.type === 'Ventilador').length;

  const chartData = [
    { type: 'Bomba', count: bombaCount },
    { type: 'Ventilador', count: ventiladorCount },
  ];

  const isWithinLimit = latency ? latency.clientMs < LATENCY_LIMIT_MS : null;

  return (
    <Box>
      <PageHeader title="Painel" subtitle="Resumo do parque de ativos monitorados" />

      <Box sx={{ px: { xs: 2, sm: 4 } }}>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(2, 1fr)',
            gap: 2,
            mb: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total de máquinas
              </Typography>
              {machinesStatus === 'loading' ? (
                <Skeleton width={60} height={48} />
              ) : (
                <Typography variant="h2">{machines.length}</Typography>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total de pontos de monitoramento
              </Typography>
              {pointsStatus === 'loading' ? (
                <Skeleton width={60} height={48} />
              ) : (
                <Typography variant="h2">{pointsTotal}</Typography>
              )}
            </CardContent>
          </Card>
        </Box>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' },
            gap: 2,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Máquinas por tipo
              </Typography>

              {machinesStatus === 'loading' ? (
                <Skeleton height={220} />
              ) : (
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" tick={{ fontSize: 12 }} />
                    <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                    <RechartsTooltip />
                    <Bar dataKey="count" name="Quantidade" radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.type}
                          fill={entry.type === 'Bomba' ? '#3B162C' : '#ECA742'}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                Latência da API ao vivo
              </Typography>

              {latency ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h2">{latency.clientMs.toFixed(0)}ms</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Medido no navegador (ida e volta completa)
                  </Typography>

                  {latency.serverMs !== null && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      Servidor reportou {latency.serverMs.toFixed(1)}ms (cabeçalho X-Response-Time)
                    </Typography>
                  )}

                  <Chip
                    sx={{ mt: 1.5 }}
                    size="small"
                    label={isWithinLimit ? 'Dentro do limite de 350ms' : 'Acima do limite de 350ms'}
                    color={isWithinLimit ? 'success' : 'error'}
                  />
                </Box>
              ) : (
                <Skeleton height={80} sx={{ mb: 2 }} />
              )}

              <Button
                variant="outlined"
                size="small"
                onClick={() => void measureLatency()}
                disabled={measuring}
                startIcon={measuring ? <CircularProgress size={16} /> : undefined}
              >
                {measuring ? 'Medindo...' : 'Medir novamente'}
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>
    </Box>
  );
}