// pages/crm/products/create.js
import { useState } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateProduct } from "@/lib/utils/validation";
import { useAllEngines } from "@/lib/hooks/useAllEngines";

export default function CreateProductPage() {
  const router = useRouter();
  const engines = useAllEngines();

  const [form, setForm] = useState({
    article: "",
    name: "",
    description: "",
    price: 0,
    count: 0,
    engineId: "",
    // img: "",
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "price" ? parseFloat(value) : parseInt(value, 10);
    setForm((prev) => ({ ...prev, [name]: isNaN(parsedValue) ? "" : parsedValue }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);

    const validation = validateProduct(form);
    if (!validation.valid) {
      setError(validation.errors);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch("/api/crm/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          engineId: form.engineId || null,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error);
      }

      const newProduct = await response.json();
      toast.success("Продукт успешно создан!");
      router.push(`/crm/products`);
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <CrmLayout>
      <h1>Создание нового продукта</h1>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mt: 3 }}>
        <TextField
          fullWidth
          required
          label="Артикул"
          name="article"
          value={form.article}
          onChange={handleChange}
          margin="normal"
          error={!!error?.includes("Артикул")}
          helperText={error?.includes("Артикул") && "Неверный формат артикула"}
        />

        <TextField
          fullWidth
          required
          label="Название"
          name="name"
          value={form.name}
          onChange={handleChange}
          margin="normal"
        />

        <TextField
          fullWidth
          multiline
          rows={3}
          label="Описание"
          name="description"
          value={form.description}
          onChange={handleChange}
          margin="normal"
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mt: 2 }}>
          <TextField
            fullWidth
            required
            label="Цена"
            name="price"
            type="number"
            value={form.price}
            onChange={handleNumberChange}
            InputProps={{ inputProps: { min: 0, step: 0.01 } }}
          />

          <TextField
            fullWidth
            required
            label="Количество"
            name="count"
            type="number"
            value={form.count}
            onChange={handleNumberChange}
            InputProps={{ inputProps: { min: 0 } }}
          />

          <FormControl fullWidth>
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
              {engines.engines.map((engine) => (
                <MenuItem key={engine.id} value={engine.id}>
                  {engine.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>

        {/* <TextField
          fullWidth
          label="URL изображения"
          name="img"
          value={form.img}
          onChange={handleChange}
          margin="normal"
        /> */}

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => router.push("/crm/products")} disabled={submitting}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={submitting}>
            {submitting ? "Создание..." : "Создать продукт"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}
