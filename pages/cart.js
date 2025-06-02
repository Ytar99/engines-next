import PublicLayout from "@/components/layouts/PublicLayout";
import cartService from "@/lib/api/cartService";
import { validateCustomer } from "@/lib/utils/validation";
import PhoneMask from "@/components/ui/fields/PhoneInput";
import {
  Box,
  Typography,
  Grid,
  Card,
  CardMedia,
  Button,
  IconButton,
  TextField,
  Divider,
  Skeleton,
  Alert,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import { Add, Remove, Delete } from "@mui/icons-material";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";
import { toast } from "react-toastify";
import useCart from "@/lib/hooks/useCart";

export default function CartPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [form, setForm] = useState({
    email: "",
    firstname: "",
    lastname: "",
    phone: "",
  });
  const [errors, setErrors] = useState({});
  const [updatingItems, setUpdatingItems] = useState({});
  const [inputValues, setInputValues] = useState({});

  const cart = useCart();
  const { items, count, total, mutate, error, isLoading } = cart;

  // Инициализация значений ввода
  useEffect(() => {
    if (items && items.length > 0) {
      const initialValues = {};
      items.forEach((item) => {
        initialValues[item.productId] = item.quantity;
      });
      setInputValues(initialValues);
    }
  }, [items]);

  const handleUpdateQuantity = async (productId, newQuantity, immediate = false) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    // Проверка на доступное количество
    if (newQuantity > item.availableCount) {
      toast.error(`Максимальное количество товара "${item.name}" на складе: ${item.availableCount}`);
      return;
    }

    setUpdatingItems((prev) => ({ ...prev, [productId]: true }));

    try {
      await cartService.updateCartItem(productId, newQuantity);
      mutate();
    } catch (error) {
      toast.error(`Ошибка обновления: ${error.message || "Попробуйте позже"}`);
      // Восстанавливаем предыдущее значение при ошибке
      setInputValues((prev) => ({
        ...prev,
        [productId]: items.find((i) => i.productId === productId).quantity,
      }));
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [productId]: false }));
    }
  };

  // Новая функция для изменения количества с ограничениями
  const handleItemQuantityChange = (productId, newValue) => {
    const item = items.find((i) => i.productId === productId);
    if (!item) return;

    // Преобразуем в число и ограничиваем диапазон
    let numericValue = parseInt(newValue) || 1;
    numericValue = Math.max(1, numericValue);
    numericValue = Math.min(numericValue, item.availableCount);

    setInputValues((prev) => ({
      ...prev,
      [productId]: numericValue,
    }));

    return numericValue;
  };

  // Обработчик изменения количества (кнопки + -)
  const handleQuantityAction = (productId, delta) => {
    const currentValue = inputValues[productId] || 1;
    const newValue = currentValue + delta;

    const finalValue = handleItemQuantityChange(productId, newValue);
    handleUpdateQuantity(productId, finalValue, true);
  };

  // Обработчик ручного ввода
  const handleManualInput = (productId, value) => {
    const finalValue = handleItemQuantityChange(productId, value);

    // Покажем ошибку если превысили лимит
    const item = items.find((i) => i.productId === productId);
    // if (item && parseInt(value) > item.availableCount) {
    //   toast.error(`Максимальное количество: ${item.availableCount} шт.`);
    // }
  };

  const handleRemoveItem = async () => {
    setUpdatingItems((prev) => ({ ...prev, [selectedProduct]: true }));

    try {
      await cartService.removeFromCart(selectedProduct);
      toast.success("Товар успешно удален из корзины");
      mutate();
    } catch (error) {
      toast.error(`Не удалось удалить товар: ${error.message || "Попробуйте позже"}`);
    } finally {
      setUpdatingItems((prev) => ({ ...prev, [selectedProduct]: false }));
      setOpenDialog(false);
    }
  };

  const handleChange = (e) => {
    setForm((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
    setErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validation = validateCustomer(form);
    if (!validation.valid) {
      setErrors(validation.errors.reduce((acc, err) => ({ ...acc, [err.field]: err.message }), {}));
      return;
    }

    try {
      const orderData = {
        customer: {
          email: form.email,
          firstname: form.firstname,
          lastname: form.lastname,
          phone: form.phone,
        },
      };

      const newOrder = await cartService.checkoutCart(orderData);

      router.push(`/check-order?orderId=${newOrder?.id}&email=${encodeURIComponent(newOrder?.customer?.email)}`);
    } catch (error) {
      const errorMessage = error.message || "Ошибка при оформлении заказа";
      toast.error(errorMessage);
      setErrors({ form: errorMessage });
    }
  };

  if (error) {
    toast.error(`Ошибка загрузки корзины: ${error.message || "Попробуйте позже"}`);
    return <Alert severity="error">Ошибка загрузки корзины</Alert>;
  }

  return (
    <PublicLayout>
      <Typography variant="h4" component="h1" sx={{ mb: 4 }}>
        Корзина
      </Typography>

      {isLoading ? (
        Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} variant="rectangular" height={120} sx={{ mb: 2, borderRadius: 2 }} />
        ))
      ) : items?.length === 0 ? (
        <Alert severity="info">Корзина пуста</Alert>
      ) : (
        <Grid container spacing={3}>
          <Grid item xs={12} md={8}>
            {items?.map((item) => {
              const isUpdating = updatingItems[item.productId];
              return (
                <Card key={item.productId} sx={{ mb: 2, p: 2 }}>
                  <Grid container spacing={2}>
                    <Grid item xs={4} sm={3}>
                      <CardMedia
                        component="img"
                        image={item.img || "/placeholder-product.jpg"}
                        alt={item.name}
                        sx={{
                          borderRadius: 1,
                          height: isMobile ? 100 : 150,
                          objectFit: "contain",
                          opacity: isUpdating ? 0.7 : 1,
                        }}
                      />
                    </Grid>

                    <Grid item xs={8} sm={9}>
                      <Typography variant="h6" gutterBottom>
                        {item.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" gutterBottom>
                        Артикул: {item.article}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        Цена: {item.price.toLocaleString("ru-RU")} ₽/шт.
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        На складе: {item.availableCount} шт.
                      </Typography>

                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          mt: 2,
                          gap: 2,
                        }}
                      >
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <IconButton
                            onClick={() => handleQuantityAction(item.productId, -1)}
                            disabled={inputValues[item.productId] <= 1 || isUpdating}
                            size="small"
                          >
                            <Remove fontSize="small" />
                          </IconButton>

                          <TextField
                            value={isUpdating ? "..." : inputValues[item.productId] || 1}
                            onChange={(e) => handleManualInput(item.productId, e.target.value)}
                            onBlur={() => handleUpdateQuantity(item.productId, inputValues[item.productId])}
                            onKeyPress={(e) =>
                              e.key === "Enter" && handleUpdateQuantity(item.productId, inputValues[item.productId])
                            }
                            disabled={isUpdating}
                            inputProps={{
                              min: 1,
                              max: item.availableCount,
                            }}
                            sx={{
                              width: 60,
                              "& .MuiInputBase-input": {
                                textAlign: "center",
                                py: 0.5,
                              },
                            }}
                            variant="outlined"
                            size="small"
                          />

                          <IconButton
                            onClick={() => handleQuantityAction(item.productId, 1)}
                            disabled={inputValues[item.productId] >= item.availableCount || isUpdating}
                            size="small"
                          >
                            <Add fontSize="small" />
                          </IconButton>
                        </Box>

                        <Typography variant="h6" sx={{ flexGrow: 1 }}>
                          {(item.price * inputValues[item.productId]).toLocaleString("ru-RU")} ₽
                        </Typography>

                        <IconButton
                          onClick={() => {
                            setSelectedProduct(item.productId);
                            setOpenDialog(true);
                          }}
                          color="error"
                          disabled={isUpdating}
                          size="small"
                        >
                          <Delete fontSize="small" />
                        </IconButton>
                      </Box>
                    </Grid>
                  </Grid>
                </Card>
              );
            })}
          </Grid>

          <Grid item xs={12} md={4}>
            <Card
              sx={{
                p: 3,
                position: "sticky",
                top: 100,
                boxShadow: theme.shadows[3],
                borderRadius: 2,
              }}
            >
              <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
                Итого
              </Typography>

              <Box sx={{ mb: 2 }}>
                <Typography variant="body1">Товары: {count} шт.</Typography>
                <Typography variant="h5" sx={{ mt: 1, fontWeight: 700 }}>
                  {total.toLocaleString("ru-RU")} ₽
                </Typography>
              </Box>

              <Divider sx={{ my: 2 }} />

              <form onSubmit={handleSubmit}>
                <Grid container spacing={2}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      required
                      label="Email"
                      name="email"
                      value={form.email || ""}
                      onChange={handleChange}
                      error={!!errors.email}
                      helperText={errors.email}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Имя"
                      name="firstname"
                      value={form.firstname || ""}
                      onChange={handleChange}
                      error={!!errors.firstname}
                      helperText={errors.firstname}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12} sm={6}>
                    <TextField
                      fullWidth
                      label="Фамилия"
                      name="lastname"
                      value={form.lastname || ""}
                      onChange={handleChange}
                      error={!!errors.lastname}
                      helperText={errors.lastname}
                      size="small"
                    />
                  </Grid>

                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Телефон"
                      name="phone"
                      value={form.phone || ""}
                      onChange={handleChange}
                      error={!!errors.phone}
                      helperText={errors.phone}
                      InputProps={{
                        inputComponent: PhoneMask,
                      }}
                      size="small"
                    />
                  </Grid>
                </Grid>

                {errors.form && (
                  <Alert severity="error" sx={{ mt: 2 }}>
                    {errors.form}
                  </Alert>
                )}

                <Button
                  fullWidth
                  variant="contained"
                  size="large"
                  type="submit"
                  disabled={!items?.length}
                  sx={{
                    mt: 3,
                    py: 1.5,
                    fontWeight: 600,
                    fontSize: "1.1rem",
                  }}
                >
                  Оформить заказ
                </Button>
              </form>
            </Card>
          </Grid>
        </Grid>
      )}

      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>Подтверждение удаления</DialogTitle>
        <DialogContent>
          <DialogContentText>Вы действительно хотите удалить товар из корзины?</DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Отмена</Button>
          <Button onClick={handleRemoveItem} color="error" variant="contained">
            Удалить
          </Button>
        </DialogActions>
      </Dialog>
    </PublicLayout>
  );
}
