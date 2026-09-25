import {
  Alert,
  alpha,
  Box,
  Chip,
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
  TableSortLabel,
  TextField,
  Typography,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/esm/DeleteOutline';
import EditIcon from '@mui/icons-material/esm/EditOutlined';
import { useEffect, useState } from 'react';
import ConfirmDialog from '../components/ConfirmDialog';
import FormDialog from '../components/FormDialog';
import PageHeader from '../components/PageHeader';
import {
  createMachine,
  deleteMachine,
  fetchMachines,
  updateMachine,
} from '../store/machineSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { Machine, MachineType } from '@dynamox/types';
import { useTranslation } from '../lib/i18n/LanguageContext';

const MACHINE_TYPES: MachineType[] = ['Bomba', 'Ventilador'];

type SortField = 'name' | 'type';
type SortOrder = 'asc' | 'desc';

interface FormState {
  name: string;
  type: MachineType | '';
}

const emptyForm: FormState = { name: '', type: '' };

interface FeedbackState {
  message: string;
  severity: 'success' | 'error';
}

export default function MachinesPage() {
  const dispatch = useAppDispatch();
  const { t } = useTranslation();
  const { items, status } = useAppSelector((state) => state.machines);

  const [sortField, setSortField] = useState<SortField | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  function machineTypeLabel(type: MachineType) {
    return type === 'Bomba' ? t('machineType.pump') : t('machineType.fan');
  }

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchMachines());
    }
  }, [status, dispatch]);

  function handleSort(field: SortField) {
    if (sortField !== field) {
      setSortField(field);
      setSortOrder('asc');
      return;
    }

    if (sortOrder === 'asc') {
      setSortOrder('desc');
      return;
    }

    setSortField(null);
  }

  const sortedItems = sortField
    ? [...items].sort((a, b) => {
      const first = sortField === 'name' ? a.name : a.type;
      const second = sortField === 'name' ? b.name : b.type;
      const comparison = first.localeCompare(second);

      return sortOrder === 'asc' ? comparison : -comparison;
    })
    : items;

  function openCreateForm() {
    setEditingMachine(null);
    setForm(emptyForm);
    setFormError(null);
    setFormOpen(true);
  }

  function openEditForm(machine: Machine) {
    setEditingMachine(machine);
    setForm({ name: machine.name, type: machine.type });
    setFormError(null);
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
  }

  async function handleSubmit() {
    if (!form.name.trim()) {
      setFormError(t('machines.nameRequired'));
      return;
    }

    if (!form.type) {
      setFormError(t('machines.typeRequired'));
      return;
    }

    setFormError(null);
    setSubmitting(true);

    const input = { name: form.name.trim(), type: form.type };

    const result = editingMachine
      ? await dispatch(updateMachine({ id: editingMachine.id, input }))
      : await dispatch(createMachine(input));

    setSubmitting(false);

    if (createMachine.rejected.match(result) || updateMachine.rejected.match(result)) {
      setFormError(result.payload ?? t('machines.saveError'));
      return;
    }

    setFormOpen(false);
    setFeedback({
      message: editingMachine ? t('machines.updateSuccess') : t('machines.createSuccess'),
      severity: 'success',
    });
  }

  async function handleConfirmDelete() {
    if (!machineToDelete) return;

    setDeleting(true);
    const result = await dispatch(deleteMachine(machineToDelete.id));
    setDeleting(false);
    setMachineToDelete(null);

    if (deleteMachine.rejected.match(result)) {
      setFeedback({
        message: result.payload ?? t('machines.deleteError'),
        severity: 'error',
      });
      return;
    }

    setFeedback({ message: t('machines.deleteSuccess'), severity: 'success' });
  }

  return (
    <Box>
      <PageHeader
        title={t('nav.machines')}
        subtitle={t('machines.subtitle')}
        actionLabel={t('machines.newMachine')}
        onAction={openCreateForm}
      />

      <Box sx={{ px: { xs: 2, sm: 4 } }}>
        <Paper variant="outlined" sx={{ overflow: 'hidden' }}>
          {status === 'loading' ? (
            <Stack spacing={1} sx={{ p: 2 }}>
              <Skeleton height={48} />
              <Skeleton height={48} />
              <Skeleton height={48} />
            </Stack>
          ) : items.length === 0 ? (
            <Typography sx={{ p: 4 }} color="text.secondary" align="center">
              {t('machines.empty')}
            </Typography>
          ) : (
            <Table
              sx={(theme) => ({
                '& .MuiTableHead-root .MuiTableRow-root': {
                  bgcolor: theme.palette.primary.main,
                },
                '& .MuiTableHead-root .MuiTableCell-root': {
                  color: theme.palette.primary.contrastText,
                  fontWeight: 600,
                },
                '& .MuiTableBody-root .MuiTableRow-root:hover': {
                  bgcolor: alpha(theme.palette.secondary.main, 0.1),
                },
              })}
            >
              <TableHead>
                <TableRow>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'name'}
                      direction={sortField === 'name' ? sortOrder : 'asc'}
                      onClick={() => handleSort('name')}
                      sx={{
                        color: 'inherit !important',
                        '& .MuiTableSortLabel-icon': {
                          color: 'inherit !important',
                          opacity: 0.5,
                        },
                        '&.Mui-active .MuiTableSortLabel-icon': {
                          opacity: 1,
                        },
                      }}
                    >
                      {t('machines.columnName')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell>
                    <TableSortLabel
                      active={sortField === 'type'}
                      direction={sortField === 'type' ? sortOrder : 'asc'}
                      onClick={() => handleSort('type')}
                      sx={{
                        color: 'inherit !important',
                        '& .MuiTableSortLabel-icon': {
                          color: 'inherit !important',
                          opacity: 0.5,
                        },
                        '&.Mui-active .MuiTableSortLabel-icon': {
                          opacity: 1,
                        },
                      }}
                    >
                      {t('machines.columnType')}
                    </TableSortLabel>
                  </TableCell>
                  <TableCell align="right">{t('machines.columnActions')}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedItems.map((machine) => (
                  <TableRow key={machine.id} hover>
                    <TableCell>{machine.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={machineTypeLabel(machine.type)}
                        size="small"
                        color={machine.type === 'Bomba' ? 'primary' : 'secondary'}
                      />
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => openEditForm(machine)}>
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => setMachineToDelete(machine)}>
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Paper>
      </Box>

      <FormDialog
        open={formOpen}
        title={editingMachine ? t('machines.editTitle') : t('machines.newMachine')}
        loading={submitting}
        onClose={closeForm}
        onSubmit={handleSubmit}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label={t('machines.columnName')}
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            autoFocus
            fullWidth
          />

          <TextField
            select
            label={t('machines.columnType')}
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, type: event.target.value as MachineType }))
            }
            fullWidth
          >
            {MACHINE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {machineTypeLabel(type)}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </FormDialog>

      <ConfirmDialog
        open={machineToDelete !== null}
        title={t('machines.deleteConfirmTitle')}
        message={`${t('machines.deleteConfirmPrefix')}"${machineToDelete?.name}"${t('machines.deleteConfirmSuffix')}`}
        loading={deleting}
        onConfirm={handleConfirmDelete}
        onCancel={() => setMachineToDelete(null)}
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