const { CircularProgress, Alert, FormControl, InputLabel, Select, MenuItem } = require("@mui/material");

const EngineSelect = ({ onSelect }) => {
  const { engines, loading, error } = useEngines();

  if (loading) return <CircularProgress />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <FormControl fullWidth>
      <InputLabel>Двигатель</InputLabel>
      <Select label="Двигатель" onChange={(e) => onSelect(e.target.value)}>
        {engines.map((engine) => (
          <MenuItem key={engine.id} value={engine.id}>
            {engine.name}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default EngineSelect;
