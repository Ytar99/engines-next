import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import {
  Box,
  Button,
  TextField,
  Autocomplete,
  Typography,
  Card,
  CardContent,
  Grid,
  Alert,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import CrmLayout from "@/components/layouts/CrmLayout";
import { validateCategorySync } from "@/lib/utils/validation";
import { useEntity } from "@/lib/hooks/useEntity";
import prisma from "@/lib/prisma";
import categoryService from "@/lib/api/categoryService";
import { useAllProducts } from "@/lib/hooks/useAllProducts";
import { toast } from "react-toastify";

export default function EditCategoryPage({ initialData }) {
  const router = useRouter();
  const { id } = router.query;
  const { updateItem, loading, error, setEntityState } = useEntity(categoryService);
  const { data: allProducts, loading: productsLoading } = useAllProducts();

  const [form, setForm] = useState({
    name: initialData?.name || "",
    slug: initialData?.slug || "",
  });

  const [selectedProducts, setSelectedProducts] = useState(initialData?.products || []);
  const [productInput, setProductInput] = useState(null);
  const [errors, setErrors] = useState([]);

  // Фильтруем продукты, исключая уже привязанные
  const availableProducts = allProducts.filter((product) => !selectedProducts.some((sp) => sp.id === product.id));

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateCategorySync(form, initialData);
    if (!validation.valid) {
      return setErrors([validation.errors]);
    }

    try {
      await updateItem(id, {
        name: form.name.trim(),
        slug: form.slug.trim().toLowerCase(),
      });
      router.push("/crm/categories");
    } catch (error) {
      setErrors([error.message]);
    }
  };

  const handleAddProduct = async () => {
    if (!productInput) return;

    // Проверка на дубликат
    if (selectedProducts.some((p) => p.id === productInput.id)) {
      setErrors(["Этот продукт уже привязан к категории"]);
      return;
    }

    try {
      await categoryService.linkProduct(id, productInput.id);
      setSelectedProducts((prev) => [...prev, productInput]);
      setProductInput(null);
      setErrors([]);
      toast.success("Продукт успешно привязан");
    } catch (error) {
      setErrors([error.message]);
    }
  };

  const handleRemoveProduct = async (productId) => {
    try {
      await categoryService.unlinkProduct(id, productId);
      setSelectedProducts((prev) => prev.filter((p) => p.id !== productId));
      setErrors([]);
      toast.success("Продукт успешно отвязан");
    } catch (error) {
      setErrors([error.message]);
    }
  };

  const handleRemoveAllProducts = async () => {
    try {
      await categoryService.unlinkAllProducts(id);
      setSelectedProducts([]);
      setErrors([]);
      toast.success("Продукты успешно отвязаны");
    } catch (error) {
      setErrors([error.message]);
    }
  };

  if (!initialData) return null;

  return (
    <CrmLayout>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Редактирование категории #{id}
        </Typography>

        {errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  margin="normal"
                  label="Название"
                  name="name"
                  value={form.name}
                  onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  required
                  fullWidth
                  size="small"
                  margin="normal"
                  label="Slug"
                  name="slug"
                  value={form.slug}
                  onChange={(e) => setForm((prev) => ({ ...prev, slug: e.target.value }))}
                  disabled={loading}
                />
              </Grid>
            </Grid>

            <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
              <Button variant="outlined" onClick={() => router.push("/crm/categories")} disabled={loading}>
                Отмена
              </Button>
              <Button type="submit" variant="contained" color="primary" disabled={loading}>
                {loading ? "Сохранение..." : "Сохранить изменения"}
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Привязанные продукты ({selectedProducts.length})
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={9}>
                <Autocomplete
                  size="small"
                  options={availableProducts}
                  loading={productsLoading}
                  getOptionLabel={(option) => `${option.article} - ${option.name}`}
                  value={productInput}
                  onChange={(_, value) => setProductInput(value)}
                  renderInput={(params) => (
                    <TextField {...params} label="Поиск продуктов" placeholder="Введите артикул или название" />
                  )}
                />
              </Grid>

              <Grid item xs={3}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={handleAddProduct}
                  disabled={!productInput}
                  fullWidth
                >
                  Добавить
                </Button>
              </Grid>
            </Grid>

            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Артикул</TableCell>
                    <TableCell>Название</TableCell>
                    <TableCell>Двигатель</TableCell>
                    <TableCell align="right">Действия</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {selectedProducts.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.article}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>
                        {product.engine?.name ? <Chip label={product.engine.name} size="small" /> : "Не указан"}
                      </TableCell>
                      <TableCell align="right">
                        <IconButton onClick={() => handleRemoveProduct(product.id)} color="error" size="small">
                          <DeleteIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>

            {selectedProducts.length === 0 && (
              <Alert severity="info" sx={{ mt: 2 }}>
                Нет привязанных продуктов
              </Alert>
            )}

            {selectedProducts.length > 0 && (
              <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
                <Button variant="contained" color="error" startIcon={<DeleteIcon />} onClick={handleRemoveAllProducts}>
                  Отвязать все продукты
                </Button>
              </Box>
            )}
          </CardContent>
        </Card>
      </Box>
    </CrmLayout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const data = await prisma.category.findUnique({
      where: { id: parseInt(id) },
      include: { products: true },
    });

    if (!data) return { notFound: true };

    const parsedData = JSON.parse(JSON.stringify(data));

    return {
      props: {
        initialData: {
          ...parsedData,
          productsCount: parsedData.products.length,
        },
      },
    };
  } catch (error) {
    return {
      redirect: {
        destination: "/crm/categories?error=EntityNotFound",
        permanent: false,
      },
    };
  }
}
