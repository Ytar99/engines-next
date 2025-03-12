// DataTableFilters.js
import { useState } from "react";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Search as SearchIcon } from "@mui/icons-material";
import TextField from "@mui/material/TextField";
import InputAdornment from "@mui/material/InputAdornment";

export const DataTableFilters = ({ filtersConfig, initialFilters, onFilterChange, searchTerm, onSearchChange }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [filters, setFilters] = useState(initialFilters);

  const handleFiltersChange = (e) => {
    const { name, value } = e.target;

    setFilters({ ...filters, [name]: value });
    onFilterChange({ [name]: value });
  };

  const renderFilterComponent = (filter) => {
    switch (filter.type) {
      case "select":
        return (
          <FormControl fullWidth={isMobile} size="small" sx={{ minWidth: 120 }} key={filter.name}>
            <InputLabel>{filter.label}</InputLabel>
            <Select
              label={filter.label}
              name={filter.name}
              value={filters[filter.name] || ""}
              onChange={handleFiltersChange}
            >
              {filter.options.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );

      case "checkbox":
        return (
          <FormControlLabel
            key={filter.name}
            control={
              <Checkbox name={filter.name} checked={filters[filter.name] || false} onChange={handleFiltersChange} />
            }
            label={filter.label}
          />
        );

      case "text":
      default:
        return (
          <TextField
            key={filter.name}
            fullWidth={isMobile}
            label={filter.label}
            name={filter.name}
            value={filters[filter.name] || ""}
            onChange={handleFiltersChange}
            size="small"
          />
        );
    }
  };

  return (
    <Box sx={{ display: "flex", gap: 2, mb: 3, flexWrap: "wrap" }}>
      <TextField
        fullWidth={isMobile}
        placeholder="Поиск..."
        variant="outlined"
        type="search"
        size="small"
        value={searchTerm}
        onChange={onSearchChange} // используй onSearchChange для обновления searchTerm
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon />
            </InputAdornment>
          ),
        }}
      />
      {filtersConfig.map((filter) => renderFilterComponent(filter))}
    </Box>
  );
};
