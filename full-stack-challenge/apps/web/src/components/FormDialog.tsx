import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/esm/Close';
import type { ReactNode } from 'react';

interface FormDialogProps {
  open: boolean;
  title: string;
  loading?: boolean;
  submitLabel?: string;
  onClose: () => void;
  onSubmit: () => void;
  children: ReactNode;
}

export default function FormDialog({
  open,
  title,
  loading = false,
  submitLabel = 'Salvar',
  onClose,
  onSubmit,
  children,
}: FormDialogProps) {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        {title}
        <IconButton onClick={onClose} size="small">
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>
      <DialogContent>{children}</DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button onClick={onSubmit} variant="contained" disabled={loading}>
          {loading ? 'Salvando...' : submitLabel}
        </Button>
      </DialogActions>
    </Dialog>
  );
}