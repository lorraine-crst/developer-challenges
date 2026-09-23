import { alpha, Alert, Box, Chip, MenuItem, Stack, TextField } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
} from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import FormDialog from '../components/FormDialog';
import PageHeader from '../components/PageHeader';
import { api, extractErrorMessage } from '../lib/api';
import { fetchMachines } from '../store/machineSlice';
import { PAGE_SIZE, fetchMonitoringPoints } from '../store/monitoringPointsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { MonitoringPointSortField, SensorModel } from '@dynamox/types';
import { isSensorModelRestricted } from '../lib/sensorRules';

const SENSOR_MODELS: SensorModel[] = ['TcAg', 'TcAs', 'HF+'];


const columns: GridColDef[] = [
  {
    field: 'machineName',
    headerName: 'Nome da Máquina',
    flex: 1,
    sortable: true,
    valueGetter: (params) => params.row.machine.name,
  },
  {
    field: 'machineType',
    headerName: 'Tipo de Máquina',
    flex: 1,
    sortable: true,
    valueGetter: (params) => params.row.machine.type,
    renderCell: (params) => (
      <Chip
        label={params.value}
        size="small"
        color={params.value === 'Bomba' ? 'primary' : 'secondary'}
      />
    ),
  },
  {
    field: 'pointName',
    headerName: 'Nome do Ponto',
    flex: 1,
    sortable: true,
    valueGetter: (params) => params.row.name,
  },
  {
    field: 'sensorModel',
    headerName: 'Modelo do Sensor',
    flex: 1,
    sortable: true,
    valueGetter: (params) => params.row.sensor?.model ?? null,
    renderCell: (params) => {
      if (!params.value) {
        return <Chip label="Sem sensor" size="small" variant="outlined" />;
      }

      const isRestricted = params.value === 'TcAg' || params.value === 'TcAs';

      return (
        <Chip
          label={params.value}
          size="small"
          sx={{
            bgcolor: isRestricted ? '#FFF3E0' : '#E8F5E9',
            color: isRestricted ? '#E65100' : '#2E7D32',
            fontWeight: 600,
          }}
        />
      );
    },
  },
];

interface SensorFormState {
  serialNumber: string;
  model: SensorModel | '';
}

const emptySensorForm: SensorFormState = { serialNumber: '', model: '' };

export default function MonitoringPointsPage() {
  const dispatch = useAppDispatch();
  const { items, total, page, sortBy, order, status } = useAppSelector(
    (state) => state.monitoringPoints,
  );
  const machines = useAppSelector((state) => state.machines.items);

  const [sensorDialogOpen, setSensorDialogOpen] = useState(false);
  const [activePointId, setActivePointId] = useState<string | null>(null);
  const [activeMachineType, setActiveMachineType] = useState<'Bomba' | 'Ventilador' | null>(
    null,
  );
  const [sensorForm, setSensorForm] = useState<SensorFormState>(emptySensorForm);
  const [sensorFormError, setSensorFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void dispatch(fetchMonitoringPoints({ page, sortBy, order }));
  }, [dispatch, page, sortBy, order]);

  useEffect(() => {
    if (machines.length === 0) {
      void dispatch(fetchMachines());
    }
  }, [machines.length, dispatch]);

  function handlePaginationChange(model: { page: number }) {
    void dispatch(fetchMonitoringPoints({ page: model.page + 1, sortBy, order }));
  }

  function handleSortChange(model: GridSortModel) {
    if (model.length === 0) return;

    const nextSortBy = model[0].field as MonitoringPointSortField;
    const nextOrder = model[0].sort ?? 'asc';

    void dispatch(fetchMonitoringPoints({ page: 1, sortBy: nextSortBy, order: nextOrder }));
  }

  function openSensorForm(pointId: string, machineType: 'Bomba' | 'Ventilador') {
    setActivePointId(pointId);
    setActiveMachineType(machineType);
    setSensorForm(emptySensorForm);
    setSensorFormError(null);
    setSensorDialogOpen(true);
  }

  function closeSensorForm() {
    setSensorDialogOpen(false);
  }

  async function handleAssociateSensor() {
    if (!activePointId) return;

    if (!sensorForm.serialNumber.trim()) {
      setSensorFormError('Informe o número de série do sensor');
      return;
    }

    if (!sensorForm.model) {
      setSensorFormError('Selecione o modelo do sensor');
      return;
    }

    setSensorFormError(null);
    setSubmitting(true);

    try {
      await api.post(`/monitoring-points/${activePointId}/sensor`, {
        serialNumber: sensorForm.serialNumber.trim(),
        model: sensorForm.model,
      });

      setSensorDialogOpen(false);
      void dispatch(fetchMonitoringPoints({ page, sortBy, order }));
    } catch (error) {
      setSensorFormError(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  const columnsWithActions: GridColDef[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      width: 160,
      renderCell: (params) => {
        if (params.row.sensor) {
          return null;
        }

        return (
          <Chip
            label="Associar sensor"
            size="small"
            variant="outlined"
            onClick={() => openSensorForm(params.row.id, params.row.machine.type)}
            sx={{ cursor: 'pointer' }}
          />
        );
      },
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Pontos de monitoramento"
        subtitle="Consulte os pontos e sensores de todas as máquinas"
      />

      <Box sx={{ px: { xs: 2, sm: 4 }, height: 480 }}>
        <DataGrid
          rows={items}
          columns={columnsWithActions}
          rowCount={total}
          loading={status === 'loading'}
          paginationMode="server"
          sortingMode="server"
          pageSizeOptions={[PAGE_SIZE]}
          paginationModel={{ page: page - 1, pageSize: PAGE_SIZE }}
          onPaginationModelChange={handlePaginationChange}
          onSortModelChange={handleSortChange}
          disableColumnMenu
          disableRowSelectionOnClick
          getRowClassName={(params) =>
            params.indexRelativeToCurrentPage % 2 === 0 ? 'even-row' : 'odd-row'
          }
          sx={(theme) => ({
            border: 'none',
            '& .MuiDataGrid-columnHeaders': {
              bgcolor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              fontSize: '0.9rem',
              fontWeight: 600,
            },
            '& .MuiDataGrid-columnHeaderTitle': {
              fontWeight: 600,
            },
            '& .MuiDataGrid-sortIcon': {
              color: theme.palette.primary.contrastText,
            },
            '& .MuiDataGrid-menuIconButton': {
              color: theme.palette.primary.contrastText,
            },
            '& .odd-row': {
              bgcolor: alpha(theme.palette.primary.main, 0.03),
            },
            '& .MuiDataGrid-row:hover': {
              bgcolor: alpha(theme.palette.secondary.main, 0.12),
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `2px solid ${theme.palette.primary.main}`,
            },
          })}
        />
      </Box>

      <FormDialog
        open={sensorDialogOpen}
        title="Associar sensor"
        loading={submitting}
        submitLabel="Associar"
        onClose={closeSensorForm}
        onSubmit={handleAssociateSensor}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {sensorFormError && <Alert severity="error">{sensorFormError}</Alert>}

          <TextField
            label="Número de série"
            value={sensorForm.serialNumber}
            onChange={(event) =>
              setSensorForm((prev) => ({ ...prev, serialNumber: event.target.value }))
            }
            autoFocus
            fullWidth
          />

          <TextField
            select
            label="Modelo"
            value={sensorForm.model}
            onChange={(event) =>
              setSensorForm((prev) => ({ ...prev, model: event.target.value as SensorModel }))
            }
            helperText={
              activeMachineType === 'Bomba'
                ? 'TcAg e TcAs não são compatíveis com máquinas do tipo Bomba'
                : undefined
            }
            fullWidth
          >
            {SENSOR_MODELS.map((model) => {
              const disabled =
                activeMachineType !== null && isSensorModelRestricted(activeMachineType, model);

              return (
                <MenuItem key={model} value={model} disabled={disabled}>
                  {model}
                </MenuItem>
              );
            })}
          </TextField>
        </Stack>
      </FormDialog>
    </Box>
  );
}