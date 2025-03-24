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
  Divider,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteIcon from "@mui/icons-material/Delete";
import CrmLayout from "@/components/layouts/CrmLayout";
import orderService from "@/lib/api/orderService";
import { useAllProducts } from "@/lib/hooks/useAllProducts";
import { validateOrder } from "@/lib/utils/validation";
import prisma from "@/lib/prisma";
import { toast } from "react-toastify";

export default function EditOrderPage({ initialOrder }) {
  const router = useRouter();
  const { id } = router.query;
  const { products, loading: productsLoading } = useAllProducts();

  const [formState, setFormState] = useState({
    customer: initialOrder.customer,
    products: initialOrder.products.map((p) => ({
      product: p.product,
      quantity: p.count,
      originalQuantity: p.count,
    })),
    status: initialOrder.status,
    errors: [],
    isCancelled: initialOrder.status === "CANCELLED",
  });

  const [productInput, setProductInput] = useState({
    product: null,
    quantity: 1,
  });

  useEffect(() => {
    if (formState.status === "CANCELLED") {
      setFormState((prev) => ({ ...prev, isCancelled: true }));
    }
  }, [formState.status]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    const orderData = {
      id: parseInt(id),
      customerId: formState.customer.id,
      status: formState.status,
      products:
        formState.status === "CANCELLED"
          ? []
          : formState.products.map((p) => ({
              productId: p.product.id,
              count: p.quantity,
              originalCount: p.originalQuantity,
            })),
    };

    const validation = validateOrder(orderData);
    if (!validation.valid) {
      setFormState((prev) => ({ ...prev, errors: [validation.errors] }));
      return;
    }

    try {
      const response = await orderService.update(id, orderData);
      router.push(`/crm/orders/${id}`);
      toast.success("Заявка успешно обновлена");
    } catch (error) {
      setFormState((prev) => ({
        ...prev,
        errors: error.response?.data?.error?.split(", ") || [error.message],
      }));
    }
  };

  const addProduct = () => {
    if (!productInput.product || productInput.quantity < 1) return;

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
          originalQuantity: 0,
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

  const updateQuantity = (productId, newQuantity) => {
    setFormState((prev) => ({
      ...prev,
      products: prev.products.map((p) =>
        p.product.id === productId ? { ...p, quantity: Math.max(1, newQuantity) } : p
      ),
    }));
  };

  return (
    <CrmLayout>
      <Box component="form" onSubmit={handleSubmit} sx={{ maxWidth: 800, mx: "auto" }}>
        <Typography variant="h4" gutterBottom>
          Редактирование заявки #{id}
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
            <Grid container spacing={2}>
              <Grid item xs={8}>
                <Typography variant="h6" gutterBottom>
                  Информация о покупателе
                </Typography>
                <Typography>
                  {formState.customer.firstname} {formState.customer.lastname}
                </Typography>
                <Typography color="text.secondary">{formState.customer.email}</Typography>
                {formState.customer.phone && (
                  <Typography color="text.secondary">Телефон: {formState.customer.phone}</Typography>
                )}
              </Grid>

              <Grid item xs={4}>
                <FormControl fullWidth size="small">
                  <InputLabel>Статус заявки</InputLabel>
                  <Select
                    value={formState.status}
                    label="Статус заявки"
                    onChange={(e) =>
                      setFormState((prev) => ({
                        ...prev,
                        status: e.target.value,
                      }))
                    }
                    disabled={formState.isCancelled}
                  >
                    <MenuItem value="NEW">Новый</MenuItem>
                    <MenuItem value="PROCESSING">В обработке</MenuItem>
                    <MenuItem value="SHIPPED">Отправлен</MenuItem>
                    <MenuItem value="COMPLETED">Завершён</MenuItem>
                    <MenuItem value="CANCELLED">Отменён</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </CardContent>
        </Card>

        <Card variant="outlined">
          <CardContent>
            <Typography variant="h6" gutterBottom>
              Товары в заявке
            </Typography>

            {formState.status !== "CANCELLED" && (
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
                          Math.max(
                            1,
                            Math.min(parseInt(e.target.value), parseInt(productInput?.product?.count || 1))
                          ) || 1,
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
            )}

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
                        Доступно:{" "}
                        {formState.status === "CANCELLED"
                          ? item.product.count + item.originalQuantity
                          : item.product.count}{" "}
                        шт.
                      </Typography>
                    </Box>
                  </Grid>

                  <Grid item xs={3}>
                    <TextField
                      type="number"
                      size="small"
                      value={item.quantity}
                      onChange={(e) => updateQuantity(item.product.id, parseInt(e.target.value))}
                      disabled={formState.isCancelled}
                      inputProps={{ min: 1 }}
                    />
                  </Grid>

                  <Grid item xs={3}>
                    {!formState.isCancelled && (
                      <IconButton onClick={() => removeProduct(item.product.id)} color="error">
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </Grid>
                </Grid>
              </Box>
            ))}
          </CardContent>
        </Card>

        <Box sx={{ mt: 3, display: "flex", gap: 2, justifyContent: "flex-end" }}>
          <Button variant="outlined" onClick={() => router.push(`/crm/orders/${id}`)}>
            Отмена
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            disabled={
              formState.status === "CANCELLED" && initialOrder.status !== "CANCELLED" ? false : formState.isCancelled
            }
          >
            Сохранить изменения
          </Button>
        </Box>
      </Box>
    </CrmLayout>
  );
}

export async function getServerSideProps(context) {
  const { id } = context.params;

  try {
    const order = await prisma.order.findUnique({
      where: { id: parseInt(id) },
      include: {
        customer: true,
        products: {
          include: {
            product: true,
          },
        },
      },
    });

    if (!order) {
      throw new Error("Заявка не найдена");
    }

    return {
      props: {
        initialOrder: JSON.parse(JSON.stringify(order)),
      },
    };
  } catch (error) {
    console.error("Error fetching order:", error);
    return {
      redirect: {
        destination: "/crm/orders?error=EntityNotFound",
        permanent: false,
      },
    };
  }
}
