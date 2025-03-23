// pages/crm/products/[id]/edit.js
import { useState } from "react";
import { useRouter } from "next/router";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateProduct } from "@/lib/utils/validation";
import { useAllEngines } from "@/lib/hooks/useAllEngines";
import prisma from "@/lib/prisma";
import { MAX_INT } from "@/lib/constants/numbers";
import productService from "@/lib/api/productsService";
import { useEntity } from "@/lib/hooks/useEntity";

export default function EditProductPage({ initialData }) {
  const router = useRouter();
  const { id } = router.query;

  const { updateItem, loading, error, setEntityState } = useEntity(productService);

  const engines = useAllEngines();

  const [form, setForm] = useState({
    article: initialData?.article || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    count: initialData?.count || 0,
    engineId: initialData?.engineId || "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateProduct(form, true);
    if (!validation.valid) {
      return setEntityState((prev) => ({ ...prev, error: validation.errors }));
    }

    // Подготовка данных для отправки
    const submitData = {
      article: form.article,
      name: form.name,
      description: form?.description || null,
      price: form.price,
      count: form.count,
      engineId: form?.engineId || null,
    };

    await updateItem(id, submitData, () => {
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

  if (!initialData) return null;

  return (
    <CrmLayout>
      <h1>Редактирование товара</h1>
      <h2>{`[${initialData.article}] ${initialData.name}`}</h2>

      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mt: 3 }}>
        <TextField
          fullWidth
          required
          size="small"
          margin="normal"
          label="Артикул"
          name="article"
          value={form.article}
          onChange={handleChange}
          error={!!error?.includes("Артикул")}
          helperText={error?.includes("Артикул") && "Неверный формат артикула"}
        />

        <TextField
          fullWidth
          required
          size="small"
          margin="normal"
          label="Название"
          name="name"
          value={form.name}
          onChange={handleChange}
        />

        <TextField
          fullWidth
          size="small"
          margin="normal"
          multiline
          minRows={3}
          label="Описание"
          name="description"
          value={form.description}
          onChange={handleChange}
        />

        <Box sx={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 2, mt: 2 }}>
          <TextField
            required
            fullWidth
            size="small"
            margin="normal"
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
            margin="normal"
            label="Количество"
            name="count"
            type="number"
            value={form.count}
            onChange={handleNumberChange}
            InputProps={{ inputProps: { min: 0, max: MAX_INT } }}
          />

          <FormControl fullWidth size="small" margin="normal">
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
            {loading ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const data = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { engine: true },
    });

    if (!data) {
      throw new Error("Запись не найдена");
    }

    return {
      props: {
        initialData: JSON.parse(JSON.stringify(data)),
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      redirect: {
        destination: "/crm/products?error=EntityNotFound",
        permanent: false,
      },
    };
  }
}
