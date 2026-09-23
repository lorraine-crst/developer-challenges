import {
  Alert,
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

const MACHINE_TYPES: MachineType[] = ['Bomba', 'Ventilador'];

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
  const { items, status } = useAppSelector((state) => state.machines);

  const [machineToDelete, setMachineToDelete] = useState<Machine | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [formOpen, setFormOpen] = useState(false);
  const [editingMachine, setEditingMachine] = useState<Machine | null>(null);
  const [form, setForm] = useState<FormState>(emptyForm);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [feedback, setFeedback] = useState<FeedbackState | null>(null);

  useEffect(() => {
    if (status === 'idle') {
      void dispatch(fetchMachines());
    }
  }, [status, dispatch]);

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
      setFormError('Informe o nome da máquina');
      return;
    }

    if (!form.type) {
      setFormError('Selecione o tipo da máquina');
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
      setFormError(result.payload ?? 'Não foi possível salvar a máquina');
      return;
    }

    setFormOpen(false);
    setFeedback({
      message: editingMachine ? 'Máquina atualizada com sucesso' : 'Máquina criada com sucesso',
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
        message: result.payload ?? 'Não foi possível excluir a máquina',
        severity: 'error',
      });
      return;
    }

    setFeedback({ message: 'Máquina excluída com sucesso', severity: 'success' });
  }

  return (
    <Box>
      <PageHeader
        title="Máquinas"
        subtitle="Gerencie o parque de ativos monitorados"
        actionLabel="Nova máquina"
        onAction={openCreateForm}
      />

      <Box sx={{ px: { xs: 2, sm: 4 } }}>
        <Paper variant="outlined">
          {status === 'loading' ? (
            <Stack spacing={1} sx={{ p: 2 }}>
              <Skeleton height={48} />
              <Skeleton height={48} />
              <Skeleton height={48} />
            </Stack>
          ) : items.length === 0 ? (
            <Typography sx={{ p: 4 }} color="text.secondary" align="center">
              Nenhuma máquina cadastrada ainda.
            </Typography>
          ) : (
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Nome</TableCell>
                  <TableCell>Tipo</TableCell>
                  <TableCell align="right">Ações</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((machine) => (
                  <TableRow key={machine.id} hover>
                    <TableCell>{machine.name}</TableCell>
                    <TableCell>
                      <Chip
                        label={machine.type}
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
        title={editingMachine ? 'Editar máquina' : 'Nova máquina'}
        loading={submitting}
        onClose={closeForm}
        onSubmit={handleSubmit}
      >
        <Stack spacing={2} sx={{ mt: 1 }}>
          {formError && <Alert severity="error">{formError}</Alert>}

          <TextField
            label="Nome"
            value={form.name}
            onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
            autoFocus
            fullWidth
          />

          <TextField
            select
            label="Tipo"
            value={form.type}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, type: event.target.value as MachineType }))
            }
            fullWidth
          >
            {MACHINE_TYPES.map((type) => (
              <MenuItem key={type} value={type}>
                {type}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
      </FormDialog>

      <ConfirmDialog
        open={machineToDelete !== null}
        title="Excluir máquina"
        message={`Tem certeza que deseja excluir "${machineToDelete?.name}"? Essa ação não pode ser desfeita.`}
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