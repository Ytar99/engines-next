// pages/crm/products/[id]/edit.js
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import { Alert, Box, Button, FormControl, InputLabel, MenuItem, Select, TextField, Typography } from "@mui/material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateProduct } from "@/lib/utils/validation";
import { useEngines } from "@/lib/hooks/useEngines";
import prisma from "@/lib/prisma";

export default function EditProductPage({ initialProduct }) {
  const router = useRouter();
  const { id } = router.query;
  const { engines, loading: enginesLoading } = useEngines();

  const [form, setForm] = useState({
    article: initialProduct?.article || "",
    name: initialProduct?.name || "",
    description: initialProduct?.description || "",
    price: initialProduct?.price || 0,
    count: initialProduct?.count || 0,
    engineId: initialProduct?.engineId || "",
    // img: initialProduct?.img || "",
  });

  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (initialProduct) {
      setForm({
        article: initialProduct.article,
        name: initialProduct.name,
        description: initialProduct.description,
        price: initialProduct.price,
        count: initialProduct.count,
        engineId: initialProduct.engineId || "",
        // img: initialProduct.img || "",
      });
    }
  }, [initialProduct]);

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

    const validation = validateProduct(form, true);
    if (!validation.valid) {
      setError(validation.errors);
      setSubmitting(false);
      return;
    }

    try {
      const response = await fetch(`/api/crm/products/${id}`, {
        method: "PUT",
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

      toast.success("Продукт успешно обновлен!");
      router.push("/crm/products");
    } catch (error) {
      setError(error.message);
      toast.error(error.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialProduct) return null;

  return (
    <CrmLayout>
      <h1>Редактирование продукта</h1>
      <h2>{`[${initialProduct.article}] ${initialProduct.name}`}</h2>

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
          minRows={3}
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
              disabled={enginesLoading}
            >
              <MenuItem value="">
                <em>Не выбрано</em>
              </MenuItem>
              {engines.map((engine) => (
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
            {submitting ? "Сохранение..." : "Сохранить изменения"}
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const product = await prisma.product.findUnique({
      where: { id: parseInt(id) },
      include: { engine: true },
    });

    if (!product) {
      return {
        redirect: {
          destination: "/crm/products",
          permanent: false,
        },
      };
    }

    return {
      props: {
        initialProduct: JSON.parse(JSON.stringify(product)),
      },
    };
  } catch (error) {
    console.error("Error fetching product:", error);
    return {
      redirect: {
        destination: "/crm/products",
        permanent: false,
      },
    };
  }
}
