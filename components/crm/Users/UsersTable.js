import { Delete as DeleteIcon, Edit as EditIcon } from "@mui/icons-material";
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
} from "@mui/material";

// Компонент таблицы пользователей
export const UserTable = ({
  users,
  totalUsers,
  page,
  setPage,
  rowsPerPage,
  setRowsPerPage,
  loading,
  handleDeleteClick,
}) => (
  <>
    <LinearProgress variant={loading ? "indeterminate" : "determinate"} color="secondary" value="100" />
    <Box sx={{ overflowX: "auto" }}>
      <Box sx={{ width: "100%", display: "table", tableLayout: "fixed" }}>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>ID</TableCell>
                <TableCell>Имя</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Роль</TableCell>
                <TableCell>Статус</TableCell>
                <TableCell>Действия</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>{user.id}</TableCell>
                  <TableCell>{[user.firstname, user.lastname].filter(Boolean).join(" ")}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>{user.enabled ? "Активен" : "Неактивен"}</TableCell>
                  <TableCell>
                    <IconButton href={`/crm/users/${user.id}/edit`} size="small" disabled={loading}>
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      onClick={() => handleDeleteClick(user.id)}
                      size="small"
                      color="error"
                      disabled={loading}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          component="div"
          count={totalUsers}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          labelDisplayedRows={({ from, to, count }) => `${from}–${to} из ${count}`}
          labelRowsPerPage="Записей на странице:"
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
          rowsPerPageOptions={[10, 25, 50]}
        />
      </Box>
    </Box>
  </>
);
