// components/common/DataTable.js
import {
  Box,
  IconButton,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  useTheme,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import LaunchIcon from "@mui/icons-material/Launch";

export const DataTable = ({
  columns,
  data,
  pagination,
  loading,
  onPageChange,
  onRowsPerPageChange,
  getEditUrl,
  getOpenUrl,
  onEdit,
  onDelete,
  actions = true,
}) => {
  const { page, limit, total, totalPages } = pagination || {};

  const theme = useTheme();

  const handleChangePage = (event, newPage) => {
    onPageChange(newPage + 1);
  };

  const handleChangeRowsPerPage = (event) => {
    onRowsPerPageChange(parseInt(event.target.value, 10));
  };

  return (
    <>
      <LinearProgress variant={loading ? "indeterminate" : "determinate"} color="secondary" value="100" />
      <Box sx={{ overflowX: "auto" }}>
        <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  {columns.map((column) => (
                    <TableCell
                      key={column.field}
                      align={column.headerAlign || "left"}
                      sx={{
                        width: column.width,
                        minWidth: column.minWidth,
                        bgcolor: theme.palette.background.default,
                        ...column.headerSx,
                      }}
                    >
                      {column.header}
                    </TableCell>
                  ))}
                  {actions && <TableCell align="right">Действия</TableCell>}
                </TableRow>
              </TableHead>
              <TableBody>
                {data.map((row) => (
                  <TableRow key={row.id}>
                    {columns.map((column) => (
                      <TableCell
                        key={column.field}
                        align={column.align || "left"}
                        sx={{
                          width: column.width,
                          minWidth: column.minWidth,
                          ...column.cellSx,
                        }}
                      >
                        {column.render ? column.render(row[column.field], row) : row[column.field] || "—"}
                      </TableCell>
                    ))}
                    {actions && (
                      <TableCell align="right">
                        {getOpenUrl && (
                          <IconButton href={getOpenUrl(row.id)} size="small" disabled={loading}>
                            <LaunchIcon />
                          </IconButton>
                        )}
                        {getEditUrl && (
                          <IconButton href={getEditUrl(row.id)} size="small" disabled={loading}>
                            <EditIcon />
                          </IconButton>
                        )}
                        {onEdit && (
                          <IconButton onClick={() => onEdit(row.id)} size="small" disabled={loading}>
                            <EditIcon />
                          </IconButton>
                        )}
                        {onDelete && (
                          <IconButton onClick={() => onDelete(row)} size="small" color="error" disabled={loading}>
                            <DeleteIcon />
                          </IconButton>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <TablePagination
            component="div"
            count={total}
            page={page - 1}
            onPageChange={handleChangePage}
            rowsPerPage={limit}
            labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
            labelRowsPerPage="Записей на странице:"
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[10, 25, 50]}
          />
        </Box>
      </Box>
    </>
  );
};
