import { alpha, Box, Chip } from '@mui/material';
import {
  DataGrid,
  type GridColDef,
  type GridSortModel,
} from '@mui/x-data-grid';
import { useEffect } from 'react';
import PageHeader from '../components/PageHeader';
import { PAGE_SIZE, fetchMonitoringPoints } from '../store/monitoringPointsSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import type { MonitoringPointSortField } from '@dynamox/types';

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
        return (
          <Chip label="Sem sensor" size="small" variant="outlined" />
        );
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

export default function MonitoringPointsPage() {
  const dispatch = useAppDispatch();
  const { items, total, page, sortBy, order, status } = useAppSelector(
    (state) => state.monitoringPoints,
  );

  useEffect(() => {
    void dispatch(fetchMonitoringPoints({ page, sortBy, order }));
  }, [dispatch, page, sortBy, order]);

  function handlePaginationChange(model: { page: number }) {
    void dispatch(fetchMonitoringPoints({ page: model.page + 1, sortBy, order }));
  }

  function handleSortChange(model: GridSortModel) {
    if (model.length === 0) return;

    const nextSortBy = model[0].field as MonitoringPointSortField;
    const nextOrder = model[0].sort ?? 'asc';

    void dispatch(fetchMonitoringPoints({ page: 1, sortBy: nextSortBy, order: nextOrder }));
  }

  return (
    <Box>
      <PageHeader
        title="Pontos de monitoramento"
        subtitle="Consulte os pontos e sensores de todas as máquinas"
      />

      <Box sx={{ px: { xs: 2, sm: 4 }, height: 480 }}>
        <DataGrid
          rows={items}
          columns={columns}
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
            '& .MuiDataGrid-columnSeparator': {
              color: alpha(theme.palette.primary.contrastText, 0.3),
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
    </Box>
  );
}