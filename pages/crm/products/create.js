// pages/crm/products/create.js
import { useState } from "react";
import { useRouter } from "next/router";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateProduct } from "@/lib/utils/validation";
import { useAllEngines } from "@/lib/hooks/useAllEngines";
import productService from "@/lib/api/productsService";
import { useEntity } from "@/lib/hooks/useEntity";
import { MAX_INT } from "@/lib/constants/numbers";

export default function CreateProductPage() {
  const router = useRouter();
  const { createItem, loading, error, setEntityState } = useEntity(productService);

  const engines = useAllEngines();

  const [form, setForm] = useState({
    article: "",
    name: "",
    description: "",
    price: 0,
    count: 0,
    engineId: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateProduct(form);
    if (!validation.valid) {
      return setEntityState((prev) => {
        return { ...prev, error: validation.errors };
      });
    }

    const submitData = {
      article: form.article,
      name: form.name,
      description: form?.description || null,
      price: form.price,
      count: form.count,
      engineId: form?.engineId || null,
    };

    createItem(submitData, () => {
      router.push("/crm/products");
    });
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "price" ? parseFloat(value) : parseInt(value, 10);
    setForm((prev) => ({ ...prev, [name]: isNaN(parsedValue) ? "" : parsedValue }));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  return (
    <CrmLayout>
      <h1>Создание нового товара</h1>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mt: 3 }}>
        <TextField
          required
          fullWidth
          size="small"
          label="Артикул"
          name="article"
          margin="normal"
          value={form.article}
          onChange={handleChange}
        />

        <TextField
          required
          fullWidth
          size="small"
          margin="normal"
          label="Название"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          size="small"
          margin="normal"
          label="Описание"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mt: 2 }}>
          <FormControl fullWidth size="small">
            <InputLabel>Двигатель</InputLabel>
            <Select
              name="engineId"
              value={form.engineId}
              onChange={handleChange}
              label="Двигатель"
              disabled={engines.loading}
            >
              <MenuItem value="">
                <em>Не выбрано</em>
              </MenuItem>
              {engines.data.map((engine) => (
                <MenuItem key={engine.id} value={engine.id}>
                  {engine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            required
            fullWidth
            size="small"
            label="Цена"
            name="price"
            type="number"
            value={form.price}
            onChange={handleNumberChange}
            InputProps={{ inputProps: { min: 0, max: MAX_INT, step: 0.01 } }}
          />

          <TextField
            required
            fullWidth
            size="small"
            label="Количество"
            name="count"
            type="number"
            value={form.count}
            onChange={handleNumberChange}
            InputProps={{ inputProps: { min: 0, max: MAX_INT } }}
          />
        </Box>

        {error && (
          <Alert severity="error" sx={{ my: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => router.push("/crm/products")} disabled={loading}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={loading}>
            {loading ? "Создание..." : "Создать товар"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}
