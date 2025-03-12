import { Search as SearchIcon } from "@mui/icons-material";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputAdornment,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  useMediaQuery,
  useTheme,
} from "@mui/material";

// Компонент фильтров
export const UserFilters = ({ filters, searchTerm, handleFilterChange, handleSearchChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <TextField
        fullWidth={isMobile}
        placeholder="Поиск..."
        variant="outlined"
        type="search"
        size="small"
        value={searchTerm}
        onChange={handleSearchChange}
        slotProps={{
          input: {
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon />
              </InputAdornment>
            ),
          },
        }}
      />
      <FormControl fullWidth={isMobile} size="small" sx={{ minWidth: 120 }}>
        <InputLabel>Роль</InputLabel>
        <Select label="Роль" name="role" value={filters.role} onChange={handleFilterChange}>
          <MenuItem value="">Все</MenuItem>
          <MenuItem value="ADMIN">Админ</MenuItem>
          <MenuItem value="USER">Пользователь</MenuItem>
        </Select>
      </FormControl>

      <Box sx={{ width: { xs: "100%", sm: "auto" } }}>
        <FormControlLabel
          control={<Checkbox name="enabled" checked={filters.enabled} onChange={handleFilterChange} />}
          label="Только активные"
        />
      </Box>
    </Box>
  );
};
