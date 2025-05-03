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
import { useState } from "react";
import useSWR from "swr";
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

  // const { data, mutate, isLoading, error } = useSWR("cart", () => cartService.getCart());
  const cart = useCart();

  const { items, count, total, mutate, error, isLoading } = cart;

  const handleUpdateQuantity = async (productId, newQuantity) => {
    try {
      await cartService.updateCartItem(productId, newQuantity);
      mutate();
    } catch (error) {
      console.error("Update error:", error);
    }
  };

  const handleRemoveItem = async () => {
    try {
      await cartService.removeFromCart(selectedProduct);
      toast.success("Товар успешно удален из корзины");
      mutate();
    } catch (error) {
      toast.error("Не удалось удалить товар из корзины");
    } finally {
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
      console.log(error);
      setErrors({ form: `Ошибка оформления заказа${error ? " – " + error.toString() : ""}` });
    }
  };

  if (error) return <Alert severity="error">Ошибка загрузки корзины – {error.toString()}</Alert>;

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
            {items?.map((item) => (
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
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity - 1)}
                          disabled={item.quantity <= 1}
                          size="small"
                        >
                          <Remove fontSize="small" />
                        </IconButton>

                        <TextField
                          value={item.quantity}
                          onChange={(e) => {
                            const value = Math.max(1, parseInt(e.target.value)) || 1;
                            handleUpdateQuantity(item.productId, value);
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
                          onClick={() => handleUpdateQuantity(item.productId, item.quantity + 1)}
                          size="small"
                        >
                          <Add fontSize="small" />
                        </IconButton>
                      </Box>

                      <Typography variant="h6" sx={{ flexGrow: 1 }}>
                        {(item.price * item.quantity).toLocaleString("ru-RU")} ₽
                      </Typography>

                      <IconButton
                        onClick={() => {
                          setSelectedProduct(item.productId);
                          setOpenDialog(true);
                        }}
                        color="error"
                        size="small"
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </Box>
                  </Grid>
                </Grid>
              </Card>
            ))}
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
                      value={form.email}
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
                      value={form.firstname}
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
                      value={form.lastname}
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
                      value={form.phone}
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
