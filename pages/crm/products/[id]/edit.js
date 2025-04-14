// pages/crm/products/[id]/edit.js
import { useCallback, useState } from "react";
import { useRouter } from "next/router";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Grid,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  Autocomplete,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
} from "@mui/material";
import { Delete as DeleteIcon, Add as AddIcon } from "@mui/icons-material";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateProduct } from "@/lib/utils/validation";

import productService from "@/lib/api/productsService";
import { useEntity } from "@/lib/hooks/useEntity";
import { MAX_INT } from "@/lib/constants/numbers";
import prisma from "@/lib/prisma";
import { useAllEngines } from "@/lib/hooks/useAllEngines";
import { useAllCategories } from "@/lib/hooks/useAllCategories";

export default function EditProductPage({ initialData }) {
  const router = useRouter();
  const { id } = router.query;

  const { updateItem, loading, error, setEntityState } = useEntity(productService);

  const engines = useAllEngines();
  const categories = useAllCategories();

  const categoriesObject = categories.data.reduce((acc, category) => {
    acc[category.id] = category;
    return acc;
  }, {});

  const [form, setForm] = useState({
    article: initialData?.article || "",
    name: initialData?.name || "",
    description: initialData?.description || "",
    price: initialData?.price || 0,
    count: initialData?.count || 0,
    engineId: initialData?.engineId || "",
    categories: initialData?.categories?.map((c) => c.id) || [],
  });

  const [selectedCategory, setSelectedCategory] = useState(null);
  const [categoryError, setCategoryError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateProduct(form, true);
    if (!validation.valid) {
      return setEntityState((prev) => ({ ...prev, error: validation.errors }));
    }

    const submitData = {
      article: form.article,
      name: form.name,
      description: form.description || null,
      price: form.price,
      count: form.count,
      engineId: form.engineId || null,
      categories: form.categories.map(Number),
    };

    await updateItem(id, submitData, () => {
      router.push("/crm/products");
    });
  };

  const handleAddCategory = useCallback(() => {
    if (!selectedCategory) return;

    if (form.categories.includes(selectedCategory.id)) {
      setCategoryError("Эта категория уже добавлена");
      return;
    }

    setCategoryError("");
    setForm((prev) => ({
      ...prev,
      categories: [...prev.categories, selectedCategory.id],
    }));
    setSelectedCategory(null);
  }, [form.categories, selectedCategory]);

  const handleRemoveCategory = useCallback((categoryId) => {
    setForm((prev) => ({
      ...prev,
      categories: prev.categories.filter((id) => id !== categoryId),
    }));
  }, []);

  const handleClearAllCategories = useCallback(() => {
    setForm((prev) => ({ ...prev, categories: [] }));
  }, []);

  const handleNumberChange = (e) => {
    const { name, value } = e.target;
    const parsedValue = name === "price" ? parseFloat(value) : parseInt(value, 10);
    setForm((prev) => ({ ...prev, [name]: isNaN(parsedValue) ? "" : parsedValue }));
  };

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const availableCategories = categories.data.filter((cat) => !form.categories.includes(cat.id));

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
        </Box>

        <Card variant="outlined" sx={{ mt: 3 }}>
          <CardContent>
            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
              <Typography variant="h6" gutterBottom>
                Выбранные категории ({form.categories.length})
              </Typography>

              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={handleClearAllCategories}
                disabled={form.categories.length === 0}
                startIcon={<DeleteIcon />}
              >
                Удалить все
              </Button>
            </Box>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={9}>
                <Autocomplete
                  size="small"
                  options={availableCategories}
                  loading={categories.loading}
                  noOptionsText="Нет доступных категорий"
                  getOptionLabel={(option) => `${option.name} (${option.slug})`}
                  value={selectedCategory}
                  onChange={(_, value) => setSelectedCategory(value)}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      label="Поиск категорий"
                      placeholder="Введите название или URL-адрес категории"
                      error={!!categoryError}
                      helperText={categoryError}
                    />
                  )}
                />
              </Grid>

              <Grid item xs={3}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddCategory}
                  disabled={!selectedCategory}
                  fullWidth
                >
                  Добавить
                </Button>
              </Grid>
            </Grid>

            {form.categories.length > 0 ? (
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Название</TableCell>
                      <TableCell>URL-адрес</TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {form.categories.map((categoryId) => {
                      const category = categoriesObject[categoryId];
                      return (
                        <TableRow key={categoryId}>
                          <TableCell>{category?.name || "Неизвестная категория"}</TableCell>
                          <TableCell>
                            <Chip label={category?.slug || "-"} size="small" variant="outlined" />
                          </TableCell>
                          <TableCell align="right">
                            <IconButton onClick={() => handleRemoveCategory(categoryId)} color="error" size="small">
                              <DeleteIcon fontSize="small" />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            ) : (
              <Alert severity="info" sx={{ mt: 2 }}>
                Нет выбранных категорий
              </Alert>
            )}
          </CardContent>
        </Card>

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
      include: {
        engine: true,
        categories: true,
      },
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
