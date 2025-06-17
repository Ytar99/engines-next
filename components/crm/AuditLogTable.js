import { useState, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  CircularProgress,
  TableContainer,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  TextField,
  InputAdornment,
  IconButton,
  TablePagination,
  Tooltip,
  MenuItem,
  Select,
  Button,
  useTheme,
  Grid,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsService from "@/lib/api/settingsService";
import { toast } from "react-toastify";
import Link from "next/link";

const METHOD_OPTIONS = ["GET", "POST", "PUT", "DELETE", "PATCH"];
const ACCESS_OPTIONS = ["GRANTED", "DENIED", "SESSION_EXPIRED"];
const STATUS_OPTIONS = ["200", "301", "302", "400", "401", "403", "404", "500"];
const ROLE_OPTIONS = ["ADMIN", "USER"];

const AuditLogTable = () => {
  const theme = useTheme();

  // Состояния для журнала аудита
  const [auditLogs, setAuditLogs] = useState([]);
  const [loadingLogs, setLoadingLogs] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalLogs, setTotalLogs] = useState(0);
  const [filters, setFilters] = useState({
    method: "",
    status: "",
    userRole: "",
    access: "",
    search: "",
    dateFrom: "",
    dateTo: "",
  });

  // Стили для статусов доступа с использованием темы MUI
  const getAccessStatusStyles = (access) => {
    switch (access) {
      case "GRANTED":
        return {
          backgroundColor: theme.palette.success.light,
          color: theme.palette.success.dark,
          fontWeight: "bold",
          padding: "2px 8px",
          borderRadius: "4px",
        };
      case "DENIED":
        return {
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.dark,
          fontWeight: "bold",
          padding: "2px 8px",
          borderRadius: "4px",
        };
      case "SESSION_EXPIRED":
        return {
          backgroundColor: theme.palette.warning.light,
          color: theme.palette.warning.dark,
          fontWeight: "bold",
          padding: "2px 8px",
          borderRadius: "4px",
        };
      default:
        return {};
    }
  };

  // Загрузка журнала аудита с сервера
  const fetchAuditLogs = async (resetPage = true) => {
    setLoadingLogs(true);
    try {
      // Сброс страницы при изменении фильтров
      if (resetPage) setPage(0);

      const params = {
        ...filters,
        page: resetPage ? 0 : page,
        limit: rowsPerPage,
      };

      const response = await SettingsService.getAuditLogs(params);

      setAuditLogs(response.logs);
      setTotalLogs(response.total);
    } catch (error) {
      // console.error("Ошибка загрузки журнала:", error);
      toast.error(`Ошибка загрузки журнала: ${error}`);
    } finally {
      setLoadingLogs(false);
    }
  };

  // Загрузка логов при монтировании
  useEffect(() => {
    fetchAuditLogs(true);
  }, [rowsPerPage]);

  // Обработчики пагинации
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
    fetchAuditLogs(false);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    setRowsPerPage(newRowsPerPage);
  };

  // Обновление фильтров
  const handleFilterChange = (name, value) => {
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  // Применение фильтров
  const applyFilters = () => {
    fetchAuditLogs(true);
  };

  // Очистка фильтров
  const clearFilters = () => {
    setFilters({
      method: "",
      status: "",
      userRole: "",
      access: "",
      search: "",
      dateFrom: "",
      dateTo: "",
    });
    fetchAuditLogs(true);
  };

  return (
    <Card>
      <CardContent>
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Typography variant="h6" gutterBottom>
            Журнал аудита
          </Typography>
          <Box>
            <Tooltip title="Обновить журнал">
              <IconButton onClick={() => fetchAuditLogs(true)} disabled={loadingLogs}>
                <RefreshIcon />
              </IconButton>
            </Tooltip>
          </Box>
        </Box>

        {/* Панель поиска и фильтров */}
        <Grid container spacing={2} sx={{ mb: 2 }}>
          <Grid item xs={12} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Поиск по всем полям"
              value={filters.search}
              onChange={(e) => handleFilterChange("search", e.target.value)}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>

          <Grid item xs={6} md={2}>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={filters.method}
              onChange={(e) => handleFilterChange("method", e.target.value)}
              renderValue={(selected) => selected || "Метод"}
            >
              <MenuItem value="">Все методы</MenuItem>
              {METHOD_OPTIONS.map((method) => (
                <MenuItem key={method} value={method}>
                  {method}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={6} md={2}>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={filters.status}
              onChange={(e) => handleFilterChange("status", e.target.value)}
              renderValue={(selected) => selected || "Статус"}
            >
              <MenuItem value="">Все статусы</MenuItem>
              {STATUS_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={6} md={2}>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={filters.access}
              onChange={(e) => handleFilterChange("access", e.target.value)}
              renderValue={(selected) => selected || "Доступ"}
            >
              <MenuItem value="">Все статусы</MenuItem>
              {ACCESS_OPTIONS.map((access) => (
                <MenuItem key={access} value={access}>
                  {access === "GRANTED" ? "Доступ" : access === "DENIED" ? "Отказано" : "Сессия истекла"}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={6} md={3}>
            <Select
              fullWidth
              displayEmpty
              size="small"
              value={filters.userRole}
              onChange={(e) => handleFilterChange("userRole", e.target.value)}
              renderValue={(selected) => selected || "Роль"}
            >
              <MenuItem value="">Все роли</MenuItem>
              {ROLE_OPTIONS.map((status) => (
                <MenuItem key={status} value={status}>
                  {status}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Дата с"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => handleFilterChange("dateFrom", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>

          <Grid item xs={6} md={3}>
            <TextField
              fullWidth
              size="small"
              label="Дата по"
              type="date"
              value={filters.dateTo}
              onChange={(e) => handleFilterChange("dateTo", e.target.value)}
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
        </Grid>

        <Box sx={{ display: "flex", gap: 2, mb: 2 }}>
          <Button variant="contained" onClick={applyFilters} startIcon={<SearchIcon />}>
            Применить фильтры
          </Button>

          <Button variant="outlined" onClick={clearFilters}>
            Очистить фильтры
          </Button>
        </Box>

        {/* Таблица с журналом */}
        <TableContainer component={Paper}>
          {loadingLogs ? (
            <Box sx={{ display: "flex", justifyContent: "center", p: 4 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: "bold" }}>Время</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Метод</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Путь</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Статус</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Пользователь</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Роль</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Доступ</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>IP</TableCell>
                    <TableCell sx={{ fontWeight: "bold" }}>Длит. (мс)</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {auditLogs.map((log, index) => (
                    <TableRow key={index} hover>
                      <TableCell>{new Date(log.time).toLocaleString()}</TableCell>
                      <TableCell>
                        <span
                          style={{
                            backgroundColor:
                              log.method === "GET"
                                ? theme.palette.info.light
                                : log.method === "POST"
                                  ? theme.palette.success.light
                                  : log.method === "PUT"
                                    ? theme.palette.warning.light
                                    : log.method === "DELETE"
                                      ? theme.palette.error.light
                                      : theme.palette.grey[200],
                            padding: "2px 8px",
                            borderRadius: "4px",
                            fontWeight: "bold",
                          }}
                        >
                          {log.method}
                        </span>
                      </TableCell>
                      <TableCell style={{ maxWidth: 200, overflow: "hidden", textOverflow: "ellipsis" }}>
                        {log.path}
                      </TableCell>
                      <TableCell>
                        <span
                          style={{
                            color:
                              log.status >= 400
                                ? theme.palette.error.main
                                : log.status >= 300
                                  ? theme.palette.warning.main
                                  : theme.palette.success.main,
                            fontWeight: "bold",
                          }}
                        >
                          {log.status}
                        </span>
                      </TableCell>
                      <TableCell>
                        {log.user?.id ? (
                          <Link href={`/crm/users/${log.user?.id}/edit`}>{log.user?.email || "Неизвестен"}</Link>
                        ) : (
                          "Гость"
                        )}
                      </TableCell>
                      <TableCell>{log.user?.role || "-"}</TableCell>
                      <TableCell>
                        <span style={getAccessStatusStyles(log.access)}>
                          {log.access === "GRANTED"
                            ? "Доступ"
                            : log.access === "DENIED"
                              ? "Отказано"
                              : log.access === "SESSION_EXPIRED"
                                ? "Сессия истекла"
                                : log.access}
                        </span>
                      </TableCell>
                      <TableCell>{log.ip}</TableCell>
                      <TableCell>{log.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>

              {auditLogs.length === 0 && !loadingLogs && (
                <Box sx={{ p: 3, textAlign: "center" }}>
                  <Typography variant="body1">Записи не найдены</Typography>
                </Box>
              )}
            </>
          )}
        </TableContainer>

        {/* Пагинация */}
        <TablePagination
          rowsPerPageOptions={[10, 25, 50]}
          component="div"
          count={totalLogs}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
          labelRowsPerPage="Записей на странице:"
          labelDisplayedRows={({ from, to, count }) => `${from}-${to} из ${count}`}
        />
      </CardContent>
    </Card>
  );
};

export default AuditLogTable;
