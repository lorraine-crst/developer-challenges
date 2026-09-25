import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
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
  Tooltip,
  Typography,
} from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/esm/ArrowBack';
import HelpOutlineIcon from '@mui/icons-material/esm/HelpOutline';
import { useState, useEffect } from 'react';
import type { ChangeEvent } from 'react';
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
import FormDialog from '../components/FormDialog';
import PageHeader from '../components/PageHeader';
import { api, extractErrorMessage } from '../lib/api';
import { deleteReadings, fetchReadings, clearReadings } from '../store/readingsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { computeForecast, formatDateLabel } from '../lib/forecast';
import { useTranslation } from '../lib/i18n/LanguageContext';
import type { TranslationKey } from '../lib/i18n/translations';

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

const SERIES_UNITS: Record<string, string> = {
  temperature: '°C',
  'velocityRms/x': 'mm/s',
  'velocityRms/y': 'mm/s',
  'velocityRms/z': 'mm/s',
  'accelerationRms/x': 'g',
  'accelerationRms/y': 'g',
  'accelerationRms/z': 'g',
};

const SERIES_LABEL_KEYS: Record<string, TranslationKey> = {
  temperature: 'series.temperature',
  'velocityRms/x': 'series.velocityX',
  'velocityRms/y': 'series.velocityY',
  'velocityRms/z': 'series.velocityZ',
  'accelerationRms/x': 'series.accelerationX',
  'accelerationRms/y': 'series.accelerationY',
  'accelerationRms/z': 'series.accelerationZ',
};

interface LocationState {
  machineName?: string;
  pointName?: string;
  hasSensor?: boolean;
}

function formatMetric(value: number | null | undefined) {
  return value === null || value === undefined ? '—' : value.toFixed(2);
}

function getLocalDateString(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

function formatDateMask(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 8);
  const day = digits.slice(0, 2);
  const month = digits.slice(2, 4);
  const year = digits.slice(4, 8);

  let result = day;
  if (month) result += `/${month}`;
  if (year) result += `/${year}`;

  return result;
}

function formatTimeMask(value: string) {
  const digits = value.replace(/\D/g, '').slice(0, 4);
  const hour = digits.slice(0, 2);
  const minute = digits.slice(2, 4);

  let result = hour;
  if (minute) result += `:${minute}`;

  return result;
}

const DATE_PATTERN = /^\d{2}\/\d{2}\/\d{4}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d$/;
const MIN_YEAR = 2000;

export default function MonitoringPointDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const location = useLocation();
  const { machineName, pointName, hasSensor = true } =
    (location.state as LocationState | null) ?? {};
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { items, metrics, activeSeriesName, status } = useAppSelector(
    (state) => state.readings,
  );

  function getSeriesInfo(seriesName: string) {
    const labelKey = SERIES_LABEL_KEYS[seriesName];

    return {
      label: labelKey ? t(labelKey) : seriesName,
      unit: SERIES_UNITS[seriesName] ?? '',
    };
  }

  const activeSeriesInfo = getSeriesInfo(activeSeriesName ?? DEFAULT_SERIES);

  const [view, setView] = useState<'chart' | 'table'>('chart');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [feedback, setFeedback] = useState<{ message: string; severity: 'success' | 'error' } | null>(
    null,
  );

  const [showLoading, setShowLoading] = useState(false);

  const today = getLocalDateString(new Date());

  const [importDialogOpen, setImportDialogOpen] = useState(false);
  const [importSubmitting, setImportSubmitting] = useState(false);
  const [importFormError, setImportFormError] = useState<string | null>(null);
  const [manualDate, setManualDate] = useState('');
  const [manualTime, setManualTime] = useState('');
  const [manualSeries, setManualSeries] = useState('');
  const [manualValue, setManualValue] = useState('');
  const [dateError, setDateError] = useState<string | null>(null);
  const [timeError, setTimeError] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  useEffect(() => {
    if (status !== 'loading') {
      setShowLoading(false);
      return;
    }

    const timeout = setTimeout(() => setShowLoading(true), 300);

    return () => clearTimeout(timeout);
  }, [status]);

  useEffect(() => {
    if (!id) return;

    if (!hasSensor) {
      dispatch(clearReadings());
      return;
    }

    void dispatch(fetchReadings({ monitoringPointId: id, seriesName: DEFAULT_SERIES }));

    return () => {
      dispatch(clearReadings());
    };
  }, [id, hasSensor, dispatch]);

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
        message: result.payload ?? t('monitoringPointDetail.deleteSeriesError'),
        severity: 'error',
      });
      return;
    }

    setFeedback({ message: t('monitoringPointDetail.deleteSeriesSuccess'), severity: 'success' });
  }

  function dateToIso(value: string) {
    const [day, month, year] = value.split('/').map(Number);

    return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  }

  function validateDate(value: string): string | null {
    if (!value) return null;
    if (!DATE_PATTERN.test(value)) return t('monitoringPointDetail.importDateInvalid');

    const [day, month, year] = value.split('/').map(Number);

    if (year < MIN_YEAR) return t('monitoringPointDetail.importDateInvalid');
    if (month < 1 || month > 12) return t('monitoringPointDetail.importDateInvalid');
    if (day < 1 || day > 31) return t('monitoringPointDetail.importDateInvalid');

    const isoDate = dateToIso(value);
    const parsed = new Date(`${isoDate}T00:00:00`);

    if (Number.isNaN(parsed.getTime())) return t('monitoringPointDetail.importDateInvalid');

    if (
      parsed.getDate() !== day ||
      parsed.getMonth() + 1 !== month ||
      parsed.getFullYear() !== year
    ) {
      return t('monitoringPointDetail.importDateInvalid');
    }

    if (isoDate > today) return t('monitoringPointDetail.importDateFuture');

    return null;
  }

  function validateTime(value: string): string | null {
    if (!value) return null;
    if (!TIME_PATTERN.test(value)) return t('monitoringPointDetail.importTimeInvalid');

    return null;
  }

  function resetImportForm() {
    setManualDate('');
    setManualTime('');
    setManualSeries('');
    setManualValue('');
    setDateError(null);
    setTimeError(null);
    setSelectedFile(null);
    setImportFormError(null);
  }

  function openImportDialog() {
    resetImportForm();
    setImportDialogOpen(true);
  }

  function closeImportDialog() {
    setImportDialogOpen(false);
  }

  function handleFileSelected(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0] ?? null;
    setSelectedFile(file);

    if (file) {
      setManualDate('');
      setManualTime('');
      setManualSeries('');
      setManualValue('');
      setDateError(null);
      setTimeError(null);
    }
  }

  function handleManualFieldChange() {
    setSelectedFile(null);
  }

  async function handleImportSubmit() {
    if (!id) return;

    setImportFormError(null);

    let payload: unknown;

    if (selectedFile) {
      try {
        const text = await selectedFile.text();
        const parsed: unknown = JSON.parse(text);

        if (!Array.isArray(parsed)) {
          setImportFormError(t('monitoringPointDetail.importInvalidFile'));
          return;
        }

        payload = parsed;
      } catch {
        setImportFormError(t('monitoringPointDetail.importInvalidFile'));
        return;
      }
    } else {
      const currentDateError = validateDate(manualDate);
      const currentTimeError = validateTime(manualTime);

      setDateError(currentDateError);
      setTimeError(currentTimeError);

      if (currentDateError || currentTimeError) {
        return;
      }

      if (!manualDate || !manualTime || !manualSeries || manualValue === '') {
        setImportFormError(t('monitoringPointDetail.importFieldsRequired'));
        return;
      }

      const numericValue = Number(manualValue);

      if (Number.isNaN(numericValue)) {
        setImportFormError(t('monitoringPointDetail.importValueInvalid'));
        return;
      }

      payload = [
        {
          seriesName: manualSeries,
          datetime: new Date(`${dateToIso(manualDate)}T${manualTime}`).toISOString(),
          value: numericValue,
        },
      ];
    }

    setImportSubmitting(true);

    try {
      await api.post(`/monitoring-points/${id}/readings`, payload);

      setImportDialogOpen(false);
      resetImportForm();
      void dispatch(
        fetchReadings({ monitoringPointId: id, seriesName: activeSeriesName ?? DEFAULT_SERIES }),
      );
      setFeedback({ message: t('monitoringPointDetail.importSuccess'), severity: 'success' });
    } catch (error) {
      setImportFormError(extractErrorMessage(error));
    } finally {
      setImportSubmitting(false);
    }
  }

  const chartData = items.map((reading) => ({
    datetime: reading.datetime,
    label: formatDateLabel(reading.datetime),
    value: reading.value,
  }));

  const forecastData = computeForecast(items, 7);
  const lastReading = items[items.length - 1];

  const forecastChartData = lastReading
    ? [
        {
          datetime: lastReading.datetime,
          label: formatDateLabel(lastReading.datetime),
          forecast: lastReading.value,
        },
        ...forecastData,
      ]
    : forecastData;

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
            : t('monitoringPointDetail.backDefault')}
        </Typography>
      </Stack>

      <PageHeader
        title={t('monitoringPointDetail.title')}
        subtitle={t('monitoringPointDetail.subtitle')}
      />

      <Box sx={{ px: { xs: 2, sm: 4 } }}>
        {!hasSensor ? (
          <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              {t('monitoringPointDetail.noSensorAssociated')}
            </Typography>
          </Paper>
        ) : (
          <>
            <Stack
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              alignItems={{ xs: 'stretch', sm: 'center' }}
              justifyContent="space-between"
              sx={{ mb: 3 }}
            >
              <TextField
                select
                label={t('monitoringPointDetail.seriesLabel')}
                value={activeSeriesName ?? DEFAULT_SERIES}
                onChange={(event) => handleSeriesChange(event.target.value)}
                sx={{ minWidth: 240 }}
              >
                {KNOWN_SERIES.map((series) => (
                  <MenuItem key={series} value={series}>
                    {getSeriesInfo(series).label}
                  </MenuItem>
                ))}
              </TextField>

              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                <Button variant="outlined" onClick={openImportDialog}>
                  {t('monitoringPointDetail.importData')}
                </Button>

                <Button
                  color="error"
                  variant="outlined"
                  disabled={items.length === 0}
                  onClick={() => setDeleteDialogOpen(true)}
                >
                  {t('monitoringPointDetail.deleteSeriesButton')}
                </Button>
              </Stack>
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
                    {t('monitoringPointDetail.totalReadings')}
                  </Typography>
                  <Typography variant="h2">{metrics?.count ?? 0}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {t('monitoringPointDetail.minimum')}
                  </Typography>
                  <Typography variant="h2">{formatMetric(metrics?.min)}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {t('monitoringPointDetail.maximum')}
                  </Typography>
                  <Typography variant="h2">{formatMetric(metrics?.max)}</Typography>
                </CardContent>
              </Card>
              <Card>
                <CardContent>
                  <Typography variant="body2" color="text.secondary">
                    {t('dashboard.average')}
                  </Typography>
                  <Typography variant="h2">{formatMetric(metrics?.avg)}</Typography>
                </CardContent>
              </Card>
            </Box>

            <Tabs value={view} onChange={(_event, value) => setView(value)} sx={{ mb: 2 }}>
              <Tab label={t('monitoringPointDetail.chartTab')} value="chart" />
              <Tab label={t('monitoringPointDetail.tableTab')} value="table" />
            </Tabs>

            {showLoading ? (
              <Skeleton height={360} />
            ) : chartData.length === 0 ? (
              <Paper variant="outlined" sx={{ p: 4, textAlign: 'center' }}>
                <Typography color="text.secondary">
                  {t('monitoringPointDetail.noReadingsFound')}
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
                      formatter={(value: number) => [
                        `${value.toFixed(2)} ${activeSeriesInfo.unit}`,
                        activeSeriesInfo.label,
                      ]}
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
                      <TableCell>{t('monitoringPointDetail.dateTimeColumn')}</TableCell>
                      <TableCell align="right">
                        {activeSeriesInfo.label} ({activeSeriesInfo.unit})
                      </TableCell>
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

            {forecastChartData.length > 1 && (
              <Box sx={{ mt: 3 }}>
                <Typography variant="h6" sx={{ mb: 2 }}>
                  {t('monitoringPointDetail.forecastTitle')}
                </Typography>

                <Paper variant="outlined" sx={{ pt: 2, pr: 2, pb: 2, pl: 0.5, height: 280 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={forecastChartData}
                      margin={{ top: 5, right: 10, bottom: 5, left: 0 }}
                    >
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
                        formatter={(value: number) => [
                          `${value.toFixed(2)} ${activeSeriesInfo.unit}`,
                          t('monitoringPointDetail.forecastLabel'),
                        ]}
                      />
                      <Line
                        type="monotone"
                        dataKey="forecast"
                        stroke="#ECA742"
                        strokeWidth={2}
                        strokeDasharray="6 4"
                        dot={false}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </Paper>

                <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                  {t('monitoringPointDetail.forecastDisclaimer')}
                </Typography>
              </Box>
            )}
          </>
        )}
      </Box>

      <FormDialog
        open={importDialogOpen}
        title={t('monitoringPointDetail.importData')}
        loading={importSubmitting}
        submitLabel={t('monitoringPointDetail.importData')}
        onClose={closeImportDialog}
        onSubmit={handleImportSubmit}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {importFormError && <Alert severity="error">{importFormError}</Alert>}

          <Stack direction="row" spacing={1} alignItems="flex-start">
            <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
              {t('monitoringPointDetail.importDescription')}
            </Typography>
            <Tooltip title={t('monitoringPointDetail.importFormatHint')} arrow>
              <IconButton size="small">
                <HelpOutlineIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          </Stack>

          <TextField
            label={t('monitoringPointDetail.importDateLabel')}
            type="text"
            placeholder="DD/MM/AAAA"
            value={manualDate}
            onChange={(event) => {
              setManualDate(formatDateMask(event.target.value));
              handleManualFieldChange();
            }}
            onBlur={() => setDateError(validateDate(manualDate))}
            error={Boolean(dateError)}
            helperText={dateError ?? undefined}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            label={t('monitoringPointDetail.importTimeLabel')}
            type="text"
            placeholder="HH:MM"
            value={manualTime}
            onChange={(event) => {
              setManualTime(formatTimeMask(event.target.value));
              handleManualFieldChange();
            }}
            onBlur={() => setTimeError(validateTime(manualTime))}
            error={Boolean(timeError)}
            helperText={timeError ?? undefined}
            InputLabelProps={{ shrink: true }}
            fullWidth
          />

          <TextField
            select
            label={t('monitoringPointDetail.seriesLabel')}
            value={manualSeries}
            onChange={(event) => {
              setManualSeries(event.target.value);
              handleManualFieldChange();
            }}
            fullWidth
          >
            {KNOWN_SERIES.map((series) => (
              <MenuItem key={series} value={series}>
                {getSeriesInfo(series).label}
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('monitoringPointDetail.importValueLabel')}
            type="number"
            value={manualValue}
            onChange={(event) => {
              setManualValue(event.target.value);
              handleManualFieldChange();
            }}
            fullWidth
          />

          <Divider>{t('common.or')}</Divider>

          <Button variant="outlined" component="label" fullWidth>
            {selectedFile ? selectedFile.name : t('monitoringPointDetail.importData')}
            <input
              type="file"
              accept="application/json,.json"
              hidden
              onChange={handleFileSelected}
            />
          </Button>
        </Stack>
      </FormDialog>

      <ConfirmDialog
        open={deleteDialogOpen}
        title={t('monitoringPointDetail.deleteSeriesTitle')}
        message={`${t('monitoringPointDetail.deleteSeriesPrefix')}${activeSeriesInfo.label}${t('monitoringPointDetail.deleteSeriesSuffix')}`}
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