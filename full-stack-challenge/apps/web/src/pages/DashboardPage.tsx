import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Link,
  Skeleton,
  Typography,
} from '@mui/material';
import { useEffect, useState } from 'react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
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
import { useTranslation } from '../lib/i18n/LanguageContext';

const LATENCY_LIMIT_MS = 350;

interface LatencyMeasurement {
  clientMs: number;
  serverMs: number | null;
}

interface TemperaturePoint {
  date: string;
  average: number;
}

interface TemperatureSeriesByType {
  Bomba: TemperaturePoint[];
  Ventilador: TemperaturePoint[];
}

function formatShortDate(isoDate: string) {
  const [, month, day] = isoDate.split('-');
  return `${day}/${month}`;
}

export default function DashboardPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { items: machines, status: machinesStatus } = useAppSelector((state) => state.machines);
  const { total: pointsTotal, status: pointsStatus } = useAppSelector(
    (state) => state.monitoringPoints,
  );

  const [measuring, setMeasuring] = useState(false);
  const [latency, setLatency] = useState<LatencyMeasurement | null>(null);

  const [temperatureSeries, setTemperatureSeries] = useState<TemperatureSeriesByType | null>(null);
  const [temperatureStatus, setTemperatureStatus] = useState<'idle' | 'loading' | 'succeeded' | 'failed'>('idle');

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

  useEffect(() => {
    async function loadTemperatureSeries() {
      setTemperatureStatus('loading');

      try {
        const response = await api.get<TemperatureSeriesByType>('/stats/average-temperature-by-type');
        setTemperatureSeries(response.data);
        setTemperatureStatus('succeeded');
      } catch {
        setTemperatureStatus('failed');
      }
    }

    void loadTemperatureSeries();
  }, []);

  const bombaCount = machines.filter((machine) => machine.type === 'Bomba').length;
  const ventiladorCount = machines.filter((machine) => machine.type === 'Ventilador').length;

  const chartData = [
    { type: t('machineType.pump'), count: bombaCount, rawType: 'Bomba' },
    { type: t('machineType.fan'), count: ventiladorCount, rawType: 'Ventilador' },
  ];

  const isWithinLimit = latency
    ? (latency.serverMs ?? latency.clientMs) < LATENCY_LIMIT_MS
    : null;

  return (
    <Box>
      <PageHeader title={t('nav.dashboard')} subtitle={t('dashboard.subtitle')} />

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
                {t('dashboard.totalMachines')}
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
                {t('dashboard.totalPoints')}
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
            gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' },
            gap: 2,
          }}
        >
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('dashboard.machinesByType')}
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
                    <Bar dataKey="count" name={t('dashboard.quantity')} radius={[4, 4, 0, 0]}>
                      {chartData.map((entry) => (
                        <Cell
                          key={entry.rawType}
                          fill={entry.rawType === 'Bomba' ? '#3B162C' : '#ECA742'}
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
                {t('dashboard.avgTemperatureByType')}
              </Typography>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 0.5 }}>
                {t('machineType.pump')}
              </Typography>
              {temperatureStatus === 'loading' ? (
                <Skeleton height={140} />
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={temperatureSeries?.Bomba ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatShortDate} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      width={32}
                      domain={['auto', 'auto']}
                      tickFormatter={(value: number) => value.toFixed(0)}
                    />
                    <RechartsTooltip
                      labelFormatter={formatShortDate}
                      formatter={(value: number) => [`${value.toFixed(1)} °C`, t('dashboard.average')]}
                    />
                    <Line type="monotone" dataKey="average" stroke="#3B162C" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}

              <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 0.5 }}>
                {t('machineType.fan')}
              </Typography>
              {temperatureStatus === 'loading' ? (
                <Skeleton height={140} />
              ) : (
                <ResponsiveContainer width="100%" height={140}>
                  <LineChart data={temperatureSeries?.Ventilador ?? []}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tick={{ fontSize: 10 }} tickFormatter={formatShortDate} />
                    <YAxis
                      tick={{ fontSize: 10 }}
                      width={32}
                      domain={['auto', 'auto']}
                      tickFormatter={(value: number) => value.toFixed(0)}
                    />
                    <RechartsTooltip
                      labelFormatter={formatShortDate}
                      formatter={(value: number) => [`${value.toFixed(1)} °C`, t('dashboard.average')]}
                    />
                    <Line type="monotone" dataKey="average" stroke="#ECA742" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" sx={{ mb: 2 }}>
                {t('dashboard.liveLatency')}
              </Typography>

              {latency ? (
                <Box sx={{ mb: 2 }}>
                  <Typography variant="h2">{latency.clientMs.toFixed(0)}ms</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.measuredInBrowser')}
                  </Typography>

                  {latency.serverMs !== null && (
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      {t('dashboard.serverReported')} {latency.serverMs.toFixed(1)}ms (X-Response-Time)
                    </Typography>
                  )}

                  <Chip
                    sx={{ mt: 1.5 }}
                    size="small"
                    label={isWithinLimit ? t('dashboard.withinLimit') : t('dashboard.aboveLimit')}
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
                {measuring ? t('dashboard.measuring') : t('dashboard.measureAgain')}
              </Button>
            </CardContent>
          </Card>
        </Box>
      </Box>

      <Box
        component="footer"
        sx={{
          mt: 4,
          py: 3,
          px: { xs: 2, sm: 4 },
          textAlign: 'center',
          borderTop: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Typography variant="body2" color="text.secondary">
          {t('dashboard.footerCredit')}{' '}
          <Link
            href="https://github.com/lorraine-crst"
            target="_blank"
            rel="noreferrer"
            color="inherit"
          >
            Lorraine Cristina
          </Link>
          , 2026
        </Typography>
        <Typography variant="caption" color="text.secondary">
          {t('dashboard.footerStack')}
        </Typography>
      </Box>
    </Box>
  );
}