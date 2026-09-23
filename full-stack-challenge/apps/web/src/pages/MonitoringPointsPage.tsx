import {
  alpha,
  Alert,
  Box,
  Chip,
  ClickAwayListener,
  IconButton,
  MenuItem,
  Snackbar,
  Stack,
  TextField,
  Tooltip,
} from '@mui/material';
import HelpOutlineIcon from '@mui/icons-material/esm/HelpOutline';
import EditIcon from '@mui/icons-material/esm/EditOutlined';
import DeleteIcon from '@mui/icons-material/esm/DeleteOutline';
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
} from '@mui/x-data-grid';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ConfirmDialog from '../components/ConfirmDialog';
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
    minWidth: 160,
    sortable: true,
    valueGetter: (params) => params.row.machine.name,
  },
  {
    field: 'machineType',
    headerName: 'Tipo de Máquina',
    flex: 1,
    minWidth: 140,
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
    minWidth: 140,
    sortable: true,
    valueGetter: (params) => params.row.name,
  },
  {
    field: 'sensorModel',
    headerName: 'Modelo do Sensor',
    flex: 1,
    minWidth: 150,
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

interface CreatePointFormState {
  machineId: string;
  name: string;
}

const emptyCreatePointForm: CreatePointFormState = { machineId: '', name: '' };

interface PointSummary {
  id: string;
  name: string;
}

interface FeedbackState {
  message: string;
  severity: 'success' | 'error';
}

export default function MonitoringPointsPage() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
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

  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [createForm, setCreateForm] = useState<CreatePointFormState>(emptyCreatePointForm);
  const [createFormError, setCreateFormError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  const [editingPoint, setEditingPoint] = useState<PointSummary | null>(null);
  const [editName, setEditName] = useState('');
  const [editFormError, setEditFormError] = useState<string | null>(null);
  const [editing, setEditing] = useState(false);

  const [pointToDelete, setPointToDelete] = useState<PointSummary | null>(null);
  const [deleteTargetName, setDeleteTargetName] = useState('');
  const [deleting, setDeleting] = useState(false);


  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  const [helpOpen, setHelpOpen] = useState(false);

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
      setFeedback({ message: 'Sensor associado com sucesso', severity: 'success' });
    } catch (error) {
      setSensorFormError(extractErrorMessage(error));
    } finally {
      setSubmitting(false);
    }
  }

  function openCreateForm() {
    setCreateForm(emptyCreatePointForm);
    setCreateFormError(null);
    setCreateDialogOpen(true);
  }

  function closeCreateForm() {
    setCreateDialogOpen(false);
  }

  async function handleCreatePoint() {
    if (!createForm.machineId) {
      setCreateFormError('Selecione a máquina');
      return;
    }

    if (!createForm.name.trim()) {
      setCreateFormError('Informe o nome do ponto');
      return;
    }

    setCreateFormError(null);
    setCreating(true);

    try {
      await api.post(`/machines/${createForm.machineId}/monitoring-points`, {
        name: createForm.name.trim(),
      });

      setCreateDialogOpen(false);
      void dispatch(fetchMonitoringPoints({ page, sortBy, order }));
      setFeedback({ message: 'Ponto de monitoramento criado com sucesso', severity: 'success' });
    } catch (error) {
      setCreateFormError(extractErrorMessage(error));
    } finally {
      setCreating(false);
    }
  }

  function openEditForm(point: PointSummary) {
    setEditingPoint(point);
    setEditName(point.name);
    setEditFormError(null);
  }

  function closeEditForm() {
    setEditingPoint(null);
  }

  async function handleEditPoint() {
    if (!editingPoint) return;

    if (!editName.trim()) {
      setEditFormError('Informe o nome do ponto');
      return;
    }

    setEditFormError(null);
    setEditing(true);

    try {
      await api.put(`/monitoring-points/${editingPoint.id}`, { name: editName.trim() });

      setEditingPoint(null);
      void dispatch(fetchMonitoringPoints({ page, sortBy, order }));
      setFeedback({ message: 'Ponto de monitoramento atualizado com sucesso', severity: 'success' });
    } catch (error) {
      setEditFormError(extractErrorMessage(error));
    } finally {
      setEditing(false);
    }
  }

  function openDeleteConfirm(point: PointSummary) {
    setPointToDelete(point);
    setDeleteTargetName(point.name);
  }

  function closeDeleteConfirm() {
    setPointToDelete(null);
  }

  async function handleDeletePoint() {
    if (!pointToDelete) return;

    setDeleting(true);

    try {
      await api.delete(`/monitoring-points/${pointToDelete.id}`);

      setPointToDelete(null);
      void dispatch(fetchMonitoringPoints({ page, sortBy, order }));
      setFeedback({ message: 'Ponto de monitoramento excluído com sucesso', severity: 'success' });
    } catch (error) {
      setFeedback({ message: extractErrorMessage(error), severity: 'error' });
    } finally {
      setDeleting(false);
    }
  }

  const columnsWithActions: GridColDef[] = [
    ...columns,
    {
      field: 'actions',
      headerName: 'Ações',
      sortable: false,
      width: 240,
      renderCell: (params) => (
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{ width: '100%' }}
        >
          <Box>
            {!params.row.sensor && (
              <Chip
                label="Associar sensor"
                size="small"
                variant="outlined"
                onClick={(event) => {
                  event.stopPropagation();
                  openSensorForm(params.row.id, params.row.machine.type);
                }}
                sx={{ cursor: 'pointer' }}
              />
            )}
          </Box>

          <Stack direction="row" spacing={0.5}>
            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                openEditForm({ id: params.row.id, name: params.row.name });
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>

            <IconButton
              size="small"
              onClick={(event) => {
                event.stopPropagation();
                openDeleteConfirm({ id: params.row.id, name: params.row.name });
              }}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Stack>
        </Stack>
      ),
    },
  ];

  return (
    <Box>
      <PageHeader
        title="Pontos de monitoramento"
        subtitle="Consulte os pontos e sensores de todas as máquinas"
        actionLabel="Novo ponto"
        onAction={openCreateForm}
      >
        <ClickAwayListener onClickAway={() => setHelpOpen(false)}>
          <Tooltip
            title="Clique em qualquer linha da tabela para abrir a série temporal (gráfico e métricas) daquele ponto de monitoramento."
            arrow
            open={helpOpen}
            onClose={() => setHelpOpen(false)}
            disableFocusListener
            disableHoverListener
            disableTouchListener
          >
            <IconButton size="small" onClick={() => setHelpOpen((prev) => !prev)}>
              <HelpOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </ClickAwayListener>
      </PageHeader>

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
          onRowClick={(params) =>
            navigate(`/monitoring-points/${params.row.id}`, {
              state: { machineName: params.row.machine.name, pointName: params.row.name },
            })
          }
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
            '& .MuiDataGrid-row': {
              cursor: 'pointer',
              userSelect: 'none',
            },
            '& .MuiDataGrid-cell:focus, & .MuiDataGrid-cell:focus-within': {
              outline: 'none',
            },
            '& .MuiDataGrid-footerContainer': {
              borderTop: `2px solid ${theme.palette.primary.main}`,
            },
          })}
        />
      </Box>

      <FormDialog
        open={createDialogOpen}
        title="Novo ponto de monitoramento"
        loading={creating}
        submitLabel="Criar"
        onClose={closeCreateForm}
        onSubmit={handleCreatePoint}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {createFormError && <Alert severity="error">{createFormError}</Alert>}

          <TextField
            select
            label="Máquina"
            value={createForm.machineId}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, machineId: event.target.value }))
            }
            helperText={machines.length === 0 ? 'Cadastre uma máquina primeiro' : undefined}
            disabled={machines.length === 0}
            fullWidth
          >
            {machines.map((machine) => (
              <MenuItem key={machine.id} value={machine.id}>
                {machine.name} ({machine.type})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label="Nome do ponto"
            value={createForm.name}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder="Ex.: Mancal Dianteiro"
            autoFocus
            fullWidth
          />
        </Stack>
      </FormDialog>

      <FormDialog
        open={editingPoint !== null}
        title="Editar ponto de monitoramento"
        loading={editing}
        submitLabel="Salvar"
        onClose={closeEditForm}
        onSubmit={handleEditPoint}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {editFormError && <Alert severity="error">{editFormError}</Alert>}

          <TextField
            label="Nome do ponto"
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            autoFocus
            fullWidth
          />
        </Stack>
      </FormDialog>

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

      <ConfirmDialog
        open={pointToDelete !== null}
        title="Excluir ponto de monitoramento"
        message={`Tem certeza que deseja excluir "${deleteTargetName}"? O sensor associado e todas as leituras desse ponto também serão excluídos permanentemente.`}
        loading={deleting}
        onConfirm={handleDeletePoint}
        onCancel={closeDeleteConfirm}
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