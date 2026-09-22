import { Box, Button, Stack, Typography } from '@mui/material';
import AddIcon from '@mui/icons-material/esm/Add';
import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  onAction?: () => void;
  children?: ReactNode;
}

export default function PageHeader({
  title,
  subtitle,
  actionLabel,
  onAction,
  children,
}: PageHeaderProps) {
  return (
    <Stack
      direction={{ xs: 'column', sm: 'row' }}
      justifyContent="space-between"
      alignItems={{ xs: 'flex-start', sm: 'center' }}
      spacing={2}
      sx={{ p: { xs: 2, sm: 4 }, pb: 2 }}
    >
      <Box>
        <Typography variant="h1">{title}</Typography>
        {subtitle && (
          <Typography color="text.secondary">{subtitle}</Typography>
        )}
      </Box>

      {actionLabel && onAction && (
        <Button variant="contained" startIcon={<AddIcon />} onClick={onAction}>
          {actionLabel}
        </Button>
      )}
      {children}
    </Stack>
  );
}