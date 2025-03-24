import { useState } from "react";
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
  Divider,
  Chip,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CrmLayout from "@/components/layouts/CrmLayout";
import orderService from "@/lib/api/orderService";
import { useAllProducts } from "@/lib/hooks/useAllProducts";
import { validateOrder } from "@/lib/utils/validation";
import { useCustomerSearch } from "@/lib/hooks/useCustomerSearch";
import { formatPhone } from "@/lib/utils/formatter";
import customerService from "@/lib/api/customerService";
import { toast } from "react-toastify";

export default function CreateOrderPage() {
  const router = useRouter();
  const { products, loading: productsLoading } = useAllProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const { customers, loading: searchLoading } = useCustomerSearch(searchQuery);

  const [formState, setFormState] = useState({
    customer: null,
    products: [],
    status: "NEW",
    errors: [],
  });

  const [productInput, setProductInput] = useState({
    product: null,
    quantity: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formState.customer?.id) {
      try {
        const newCustomer = await customerService.create({
          email: formState.customer.email,
        });
        formState.customer = newCustomer.data;
        toast.success("Новый покупатель успешно создан");
      } catch (error) {
        console.error(error);
        return setFormState((prev) => ({
          ...prev,
          errors: ["Не удалось создать покупателя"],
        }));
      }
    }

    const orderData = {
      customerId: formState.customer?.id,
      status: formState.status,
      products: formState.products.map((p) => ({
        productId: p.product.id,
        count: p.quantity,
      })),
    };

    const validation = validateOrder(orderData);
    if (!validation.valid) {
      setFormState((prev) => ({ ...prev, errors: [validation.errors] }));
      return;
    }

    try {
      const response = await orderService.create(orderData);
      router.push(`/crm/orders/${response.data.id}`);
      toast.success("Заявка успешно создана");
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        errors: error.response?.data?.error?.split(", ") || [error.message],
      }));
    }
  };

  const addProduct = () => {
    if (!productInput.product || productInput.quantity < 1) return;

    // Проверка на дубликаты
    const isDuplicate = formState.products.some((p) => p.product.id === productInput.product.id);

    if (isDuplicate) {
      setFormState((prev) => ({
        ...prev,
        errors: ["Этот товар уже добавлен в заявку"],
      }));
      return;
    }

    setFormState((prev) => ({
      ...prev,
      products: [
        ...prev.products,
        {
          product: productInput.product,
          quantity: productInput.quantity,
          available: productInput.product.count,
        },
      ],
      errors: prev.errors.filter((e) => !e.includes("товар")),
    }));

    setProductInput({ product: null, quantity: 1 });
  };

  const removeProduct = (productId) => {
    setFormState((prev) => ({
      ...prev,
      products: prev.products.filter((p) => p.product.id !== productId),
    }));
  };

  return (
    <CrmLayout>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Создание новой заявки
        </Typography>

        {formState.errors.length > 0 && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {formState.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </Alert>
        )}

        <Card variant="outlined" sx={{ mb: 3 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Информация о покупателе
            </Typography>

            <Autocomplete
              freeSolo
              size="small"
              options={customers}
              loading={searchLoading}
              inputValue={searchQuery}
              onInputChange={(e, value) => {
                setSearchQuery(value);
                // Обновляем customer при каждом изменении текста
                setFormState((prev) => ({
                  ...prev,
                  customer: { email: value },
                  errors: prev.errors.filter((e) => !e.includes("покупатель")),
                }));
              }}
              getOptionLabel={(option) => (typeof option === "string" ? option : option.email)}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label="Email покупателя"
                  required
                  helperText="Начните вводить email"
                  onBlur={(e) => {
                    // Фиксируем последнее значение при потере фокуса
                    if (!formState.customer?.id && e.target.value) {
                      setFormState((prev) => ({
                        ...prev,
                        customer: { email: e.target.value },
                        errors: prev.errors.filter((e) => !e.includes("покупатель")),
                      }));
                    }
                  }}
                />
              )}
              onChange={(e, value) => {
                if (value) {
                  setFormState((prev) => ({
                    ...prev,
                    customer: typeof value === "string" ? { email: value } : value,
                  }));
                }
              }}
            />

            {/* Информация о существующем покупателе */}
            {formState.customer?.id && (
              <Box sx={{ mt: 2, pl: 1 }}>
                <Typography variant="body2">
                  {formState.customer.firstname} {formState.customer.lastname}
                </Typography>
                {formState.customer.phone && (
                  <Typography variant="body2" color="text.secondary">
                    Телефон: {formatPhone(formState.customer.phone)}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Зарегистрирован: {new Date(formState.customer.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Товары в заявке
            </Typography>

            <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
              <Grid item xs={8}>
                <Autocomplete
                  size="small"
                  options={products}
                  loading={productsLoading}
                  getOptionLabel={(option) => `${option.name} (${option.article})`}
                  value={productInput.product}
                  onChange={(e, value) =>
                    setProductInput((prev) => ({
                      ...prev,
                      product: value,
                    }))
                  }
                  renderInput={(params) => <TextField {...params} label="Выберите товар" fullWidth />}
                />
              </Grid>

              <Grid item xs={2}>
                <TextField
                  disabled={!productInput?.product}
                  size="small"
                  type="number"
                  label="Количество"
                  value={productInput.quantity}
                  onChange={(e) => {
                    setProductInput((prev) => ({
                      ...prev,
                      quantity:
                        Math.max(1, Math.min(parseInt(e.target.value), parseInt(productInput?.product?.count || 1))) ||
                        1,
                    }));
                  }}
                  fullWidth
                />
                {productInput?.product && (
                  <Typography sx={{ position: "absolute" }} variant="body2" color="text.secondary">
                    Доступно: {productInput.product.count} шт.
                  </Typography>
                )}
              </Grid>

              <Grid item xs={2}>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={addProduct}
                  disabled={!productInput.product || !productInput.product?.count}
                  fullWidth
                >
                  Добавить
                </Button>
              </Grid>
            </Grid>

            {formState.products.map((item) => (
              <Box key={item.product.id} sx={{ mb: 2 }}>
                <Divider sx={{ mb: 2 }} />

                <Grid container alignItems="center" spacing={2}>
                  <Grid item xs={6}>
                    <Box>
                      {item.product.name}
                      <Typography variant="body2" color="text.secondary">
                        Артикул: {item.product.article}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Доступно: {item.available} шт.
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={3}>
                    <Typography>× {item.quantity}</Typography>
                  </Grid>

                  <Grid item xs={3}>
                    <IconButton onClick={() => removeProduct(item.product.id)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => router.push("/crm/orders")}>
            Отмена
          </Button>
          <Button type="submit" variant="contained" color="primary" disabled={formState.products.length === 0}>
            Создать заявку
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}
