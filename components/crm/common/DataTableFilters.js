// DataTableFilters.js
import { useState } from "react";
import {
  Box,
  Button,
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
import DateRangePicker from "@/components/crm/common/DateRangePicker";

export const DataTableFilters = ({
  filtersConfig,
  initialFilters,
  onFilterChange,
  searchTerm,
  onSearchChange,
  onResetFilters,
}) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  const [filters, setFilters] = useState(initialFilters);

  const handleFiltersChange = (e) => {
    const { name, value, checked, type } = e.target;

    let newValue = value;

    if (type === "checkbox") {
      newValue = checked;
    }

    if (type === "dateRange") {
      newValue = [value.startDate, value.endDate];
    }

    setFilters({ ...filters, [name]: newValue });
    onFilterChange({ [name]: newValue });
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
              onChange={filter.onChange ? filter.onChange : handleFiltersChange}
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
              <Checkbox
                name={filter.name}
                checked={filters[filter.name] || false}
                onChange={filter.onChange ? filter.onChange : handleFiltersChange}
              />
            }
            label={filter.label}
          />
        );

      case "dateRange":
        return (
          <DateRangePicker
            key={filter.name}
            label={filter.label}
            value={filters[filter.name] || [null, null]}
            onChange={(newValue) => {
              filter.onChange
                ? filter.onChange({ target: { name: filter.name, value: newValue } })
                : handleFiltersChange({ target: { name: filter.name, value: newValue } });

              // setFilters({ ...filters, [filter.name]: newValue });
              // onFilterChange({ [filter.name]: newValue });
            }}
            size="small"
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
            onChange={filter.onChange ? filter.onChange : handleFiltersChange}
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
      {onResetFilters && (
        <Box>
          <Button onClick={onResetFilters} variant="outlined">
            Сбросить
          </Button>
        </Box>
      )}
    </Box>
  );
};
