import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  IconButton,
  MenuItem,
  Paper,
  Skeleton,
  Snackbar,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  TextField,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/esm/ArrowBack';
import { useState, useEffect } from 'react';
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip as RechartsTooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useLocation, useNavigate, useParams } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
import PageHeader from '../components/PageHeader';
import { deleteReadings, fetchReadings, clearReadings } from '../store/readingsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

const DEFAULT_SERIES = 'temperature';

const KNOWN_SERIES = [
  'temperature',
  'velocityRms/x',
  'velocityRms/y',
  'velocityRms/z',
  'accelerationRms/x',
  'accelerationRms/y',
  'accelerationRms/z',
];

interface LocationState {
  machineName?: string;
  pointName?: string;
}

function formatDateLabel(isoDate: string) {
  const date = new Date(isoDate);

  return date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });
}

function formatMetric(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : value.toFixed(2);
}

export default function MonitoringPointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { machineName, pointName } = (location.state as LocationState | null) ?? {};
  const dispatch = useAppDispatch();
  const { items, metrics, activeSeriesName, status } = useAppSelector(
    (state) => state.readings,
  );

  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(
    null,
  );

  useEffect(() => {
    if (!id) return;

    void dispatch(fetchReadings({ monitoringPointId: id, seriesName: DEFAULT_SERIES }));

    return () => {
      dispatch(clearReadings());
    };
  }, [id, dispatch]);

  function handleSeriesChange(seriesName: string) {
    if (!id) return;

    void dispatch(fetchReadings({ monitoringPointId: id, seriesName }));
  }

  async function handleDelete() {
    if (!id || !activeSeriesName) return;

    setDeleting(true);

    const result = await dispatch(
      deleteReadings({ monitoringPointId: id, seriesName: activeSeriesName }),
    );

    setDeleting(false);
    setDeleteDialogOpen(false);

    if (deleteReadings.rejected.match(result)) {
      setFeedback({
        message: result.payload ?? 'Não foi possível excluir a série',
        severity: 'error',
      });
      return;
    }

    setFeedback({ message: 'Série excluída com sucesso', severity: 'success' });
  }

  const chartData = items.map((reading) => ({
    datetime: reading.datetime,
    label: formatDateLabel(reading.datetime),
    value: reading.value,
  }));

  return (
    <Box>
      <Stack
        direction="row"
        alignItems="center"
        spacing={1}
        sx={{ px: { xs: 2, sm: 4 }, pt: 2 }}
      >
        <IconButton size="small" onClick={() => navigate('/monitoring-points')}>
          <ArrowBackIcon fontSize="small" />
        </IconButton>
        <Typography variant="body2" color="text.secondary">
          {machineName && pointName
            ? `${machineName} — ${pointName}`
            : 'Voltar para pontos de monitoramento'}
        </Typography>
      </Stack>

      <PageHeader title="Série temporal" subtitle="Detalhe do ponto de monitoramento" />

      <Box sx={{ px: { xs: 2, sm: 4 } }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={2}
          alignItems={{ xs: 'stretch', sm: 'center' }}
          justifyContent="space-between"
          sx={{ mb: 3 }}
        >
          <TextField
            select
            label="Série"
            value={activeSeriesName ?? DEFAULT_SERIES}
            onChange={(event) => handleSeriesChange(event.target.value)}
            sx={{ minWidth: 240 }}
          >
            {KNOWN_SERIES.map((series) => (
              <MenuItem key={series} value={series}>
                {series}
              </MenuItem>
            ))}
          </TextField>

          <Button
            color="error"
            variant="outlined"
            disabled={items.length === 0}
            onClick={() => setDeleteDialogOpen(true)}
          >
            Excluir dados desta série
          </Button>
        </Stack>

        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(4, 1fr)' },
            gap: 2,
            mb: 3,
          }}
        >
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Total de leituras
              </Typography>
              <Typography variant="h2">{metrics?.count ?? 0}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Mínimo
              </Typography>
              <Typography variant="h2">{formatMetric(metrics?.min)}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Máximo
              </Typography>
              <Typography variant="h2">{formatMetric(metrics?.max)}</Typography>
            </CardContent>
          </Card>
          <Card>
            <CardContent>
              <Typography variant="body2" color="text.secondary">
                Média
              </Typography>
              <Typography variant="h2">{formatMetric(metrics?.avg)}</Typography>
            </CardContent>
          </Card>
        </Box>

        <Tabs value={view} onChange={(_event, value) => setView(value)} sx={{ mb: 2 }}>
          <Tab label="Gráfico" value="chart" />
          <Tab label="Tabela" value="table" />
        </Tabs>

        {status === 'loading' ? (
          <Skeleton height={360} />
        ) : chartData.length === 0 ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              Nenhuma leitura encontrada para esta série.
            </Typography>
          </Paper>
        ) : view === 'chart' ? (
          <Paper variant="outlined" sx={{ pt: 2, pr: 2, pb: 2, pl: 0.5, height: 360 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 10, bottom: 5, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="label" tick={{ fontSize: 12 }} />
                <YAxis
                  tick={{ fontSize: 12 }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value: number) => value.toFixed(1)}
                  width={40}
                />
                <RechartsTooltip
                  labelFormatter={(_label, payload) =>
                    payload?.[0]
                      ? new Date(payload[0].payload.datetime).toLocaleString('pt-BR')
                      : ''
                  }
                  formatter={(value: number) => [value.toFixed(2), 'Valor']}
                />
                <Line
                  type="monotone"
                  dataKey="value"
                  stroke="#3B162C"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </Paper>
        ) : (
          <Paper variant="outlined" sx={{ maxHeight: 360, overflow: 'auto' }}>
            <Table stickyHeader size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Data e hora</TableCell>
                  <TableCell align="right">Valor</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((reading) => (
                  <TableRow key={reading.id}>
                    <TableCell>{new Date(reading.datetime).toLocaleString('pt-BR')}</TableCell>
                    <TableCell align="right">{reading.value.toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        )}
      </Box>

      <ConfirmDialog
        open={deleteDialogOpen}
        title="Excluir série"
        message={`Tem certeza que deseja excluir todos os dados da série "${activeSeriesName}"? Essa ação não pode ser desfeita.`}
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteDialogOpen(false)}
      />

      <Snackbar
        open={feedback !== null}
        autoHideDuration={4000}
        onClose={() => setFeedback(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {feedback ? (
          <Alert severity={feedback.severity} onClose={() => setFeedback(null)}>
            {feedback.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </Box>
  );
}