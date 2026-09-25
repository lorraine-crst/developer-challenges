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
import type { MachineType, MonitoringPointSortField, SensorModel } from '@dynamox/types';
import { isSensorModelRestricted } from '../lib/sensorRules';
import { useTranslation } from '../lib/i18n/LanguageContext';

const SENSOR_MODELS: SensorModel[] = ['TcAg', 'TcAs', 'HF+'];

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
  const { t } = useTranslation();
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

  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    if (status !== 'loading') {
      setShowLoading(false);
      return;
    }

    const timeout = setTimeout(() => setShowLoading(true), 300);

    return () => clearTimeout(timeout);
  }, [status]);

  function machineTypeLabel(type: MachineType) {
    return type === 'Bomba' ? t('machineType.pump') : t('machineType.fan');
  }

  const columns: GridColDef[] = [
    {
      field: 'machineName',
      headerName: t('monitoringPoints.columnMachineName'),
      flex: 1,
      minWidth: 160,
      sortable: true,
      valueGetter: (params) => params.row.machine.name,
    },
    {
      field: 'machineType',
      headerName: t('monitoringPoints.columnMachineType'),
      flex: 1,
      minWidth: 140,
      sortable: true,
      valueGetter: (params) => params.row.machine.type,
      renderCell: (params) => (
        <Chip
          label={machineTypeLabel(params.value)}
          size="small"
          color={params.value === 'Bomba' ? 'primary' : 'secondary'}
        />
      ),
    },
    {
      field: 'pointName',
      headerName: t('monitoringPoints.columnPointName'),
      flex: 1,
      minWidth: 140,
      sortable: true,
      valueGetter: (params) => params.row.name,
    },
    {
      field: 'sensorModel',
      headerName: t('monitoringPoints.columnSensorModel'),
      flex: 1,
      minWidth: 150,
      sortable: true,
      valueGetter: (params) => params.row.sensor?.model ?? null,
      renderCell: (params) => {
        if (!params.value) {
          return <Chip label={t('monitoringPoints.noSensor')} size="small" variant="outlined" />;
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
      setSensorFormError(t('monitoringPoints.serialNumberRequired'));
      return;
    }

    if (!sensorForm.model) {
      setSensorFormError(t('monitoringPoints.modelRequired'));
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
      setFeedback({ message: t('monitoringPoints.sensorAssociatedSuccess'), severity: 'success' });
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
      setCreateFormError(t('monitoringPoints.machineRequired'));
      return;
    }

    if (!createForm.name.trim()) {
      setCreateFormError(t('monitoringPoints.pointNameRequired'));
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
      setFeedback({ message: t('monitoringPoints.pointCreatedSuccess'), severity: 'success' });
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
      setEditFormError(t('monitoringPoints.pointNameRequired'));
      return;
    }

    setEditFormError(null);
    setEditing(true);

    try {
      await api.put(`/monitoring-points/${editingPoint.id}`, { name: editName.trim() });

      setEditingPoint(null);
      void dispatch(fetchMonitoringPoints({ page, sortBy, order }));
      setFeedback({ message: t('monitoringPoints.pointUpdatedSuccess'), severity: 'success' });
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
      setFeedback({ message: t('monitoringPoints.pointDeletedSuccess'), severity: 'success' });
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
      headerName: t('monitoringPoints.columnActions'),
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
                label={t('monitoringPoints.associateSensor')}
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
        title={t('nav.monitoringPoints')}
        subtitle={t('monitoringPoints.subtitle')}
        actionLabel={t('monitoringPoints.newPoint')}
        onAction={openCreateForm}
      >
        <ClickAwayListener onClickAway={() => setHelpOpen(false)}>
          <Tooltip
            title={t('monitoringPoints.helpTooltip')}
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

      <Box sx={{ px: { xs: 2, sm: 4 } }}>
        <DataGrid
          rows={items}
          columns={columnsWithActions}
          rowCount={total}
          loading={showLoading}
          autoHeight
          paginationMode="server"
          sortingMode="server"
          pageSizeOptions={[PAGE_SIZE]}
          paginationModel={{ page: page - 1, pageSize: PAGE_SIZE }}
          onPaginationModelChange={handlePaginationChange}
          onSortModelChange={handleSortChange}
          onRowClick={(params) =>
            navigate(`/monitoring-points/${params.row.id}`, {
              state: {
                machineName: params.row.machine.name,
                pointName: params.row.name,
                hasSensor: Boolean(params.row.sensor),
              },
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
              opacity: '0.5 !important',
            },
            '& .MuiDataGrid-columnHeader--sorted .MuiDataGrid-sortIcon': {
              opacity: '1 !important',
            },
            '& .MuiDataGrid-iconButtonContainer': {
              visibility: 'visible !important',
              width: 'auto !important',
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
        title={t('monitoringPoints.createTitle')}
        loading={creating}
        submitLabel={t('monitoringPoints.create')}
        onClose={closeCreateForm}
        onSubmit={handleCreatePoint}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {createFormError && <Alert severity="error">{createFormError}</Alert>}

          <TextField
            select
            label={t('monitoringPoints.machineLabel')}
            value={createForm.machineId}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, machineId: event.target.value }))
            }
            helperText={machines.length === 0 ? t('monitoringPoints.createFirstMachineHint') : undefined}
            disabled={machines.length === 0}
            fullWidth
          >
            {machines.map((machine) => (
              <MenuItem key={machine.id} value={machine.id}>
                {machine.name} ({machineTypeLabel(machine.type)})
              </MenuItem>
            ))}
          </TextField>

          <TextField
            label={t('monitoringPoints.pointNameLabel')}
            value={createForm.name}
            onChange={(event) =>
              setCreateForm((prev) => ({ ...prev, name: event.target.value }))
            }
            placeholder={t('monitoringPoints.pointNamePlaceholder')}
            autoFocus
            fullWidth
          />
        </Stack>
      </FormDialog>

      <FormDialog
        open={editingPoint !== null}
        title={t('monitoringPoints.editTitle')}
        loading={editing}
        submitLabel={t('common.save')}
        onClose={closeEditForm}
        onSubmit={handleEditPoint}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {editFormError && <Alert severity="error">{editFormError}</Alert>}

          <TextField
            label={t('monitoringPoints.pointNameLabel')}
            value={editName}
            onChange={(event) => setEditName(event.target.value)}
            autoFocus
            fullWidth
          />
        </Stack>
      </FormDialog>

      <FormDialog
        open={sensorDialogOpen}
        title={t('monitoringPoints.associateSensorTitle')}
        loading={submitting}
        submitLabel={t('monitoringPoints.associate')}
        onClose={closeSensorForm}
        onSubmit={handleAssociateSensor}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {sensorFormError && <Alert severity="error">{sensorFormError}</Alert>}

          <TextField
            label={t('monitoringPoints.serialNumberLabel')}
            value={sensorForm.serialNumber}
            onChange={(event) =>
              setSensorForm((prev) => ({ ...prev, serialNumber: event.target.value }))
            }
            autoFocus
            fullWidth
          />

          <TextField
            select
            label={t('monitoringPoints.modelLabel')}
            value={sensorForm.model}
            onChange={(event) =>
              setSensorForm((prev) => ({ ...prev, model: event.target.value as SensorModel }))
            }
            helperText={
              activeMachineType === 'Bomba' ? t('monitoringPoints.pumpRestrictionHint') : undefined
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
        title={t('monitoringPoints.deleteConfirmTitle')}
        message={`${t('monitoringPoints.deleteConfirmPrefix')}"${deleteTargetName}"${t('monitoringPoints.deleteConfirmSuffix')}`}
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