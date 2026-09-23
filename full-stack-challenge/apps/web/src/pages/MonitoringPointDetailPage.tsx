import {
  Box,
  MenuItem,
  Skeleton,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useEffect } from 'react';
import { useParams } from 'react-router-dom';
import PageHeader from '../components/PageHeader';
import { fetchReadings, clearReadings } from '../store/readingsSlice';
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

export default function MonitoringPointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const { items, metrics, activeSeriesName, status } = useAppSelector(
    (state) => state.readings,
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

  return (
    <Box>
      <PageHeader title="Série temporal" subtitle="Detalhe do ponto de monitoramento" />

      <Box sx={{ px: { xs: 2, sm: 4 } }}>
        <Stack direction="row" spacing={2} alignItems="center" sx={{ mb: 3 }}>
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
        </Stack>

        {status === 'loading' ? (
          <Skeleton height={300} />
        ) : (
          <Typography>
            {items.length} leituras carregadas. Métricas: {JSON.stringify(metrics)}
          </Typography>
        )}
      </Box>
    </Box>
  );
}