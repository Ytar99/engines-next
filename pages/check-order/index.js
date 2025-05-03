import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/router";
import {
  Container,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Alert,
  Paper,
  Grid,
  List,
  ListItem,
  ListItemText,
  Chip,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import QueryBuilderIcon from "@mui/icons-material/QueryBuilder";
import ErrorIcon from "@mui/icons-material/Error";
import HistoryToggleOffIcon from "@mui/icons-material/HistoryToggleOff";
import catalogService from "@/lib/api/catalogService";
import Image from "next/image";
import PublicLayout from "@/components/layouts/PublicLayout";

const statusConfig = {
  NEW: { color: "info", label: "На рассмотрении", icon: <HistoryToggleOffIcon /> },
  PROCESSING: { color: "warning", label: "В обработке", icon: <QueryBuilderIcon /> },
  COMPLETED: { color: "success", label: "Завершен", icon: <CheckCircleIcon /> },
  CANCELLED: { color: "error", label: "Отменен", icon: <ErrorIcon /> },
};

export default function OrderStatusPage() {
  const router = useRouter();
  const { orderId: queryOrderId, email: queryEmail } = router.query;

  const [orderId, setOrderId] = useState(queryOrderId || "");
  const [email, setEmail] = useState(queryEmail || "");
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  const isValidOrderId = (id) => /^\d+$/.test(id);

  // Новый useEffect для обработки запросов при изменении URL
  useEffect(() => {
    const fetchOrder = async () => {
      const { orderId: currentOrderId, email: currentEmail } = router.query;
      setOrderId(currentOrderId); // Синхронизация состояния с URL
      setEmail(currentEmail);

      if (!currentOrderId || !currentEmail) return;

      if (!isValidOrderId(currentOrderId)) {
        setError("Некорректный номер заказа");
        return;
      }

      if (!isValidEmail(currentEmail)) {
        setError("Некорректный email");
        return;
      }

      try {
        setLoading(true);
        setError("");
        const data = await catalogService.getOrder(currentOrderId, currentEmail);
        setOrder(data);
      } catch (err) {
        setError(err.message || "Ошибка при загрузке заказа");
        setOrder(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrder();
  }, [router.query]); // Зависим от изменений в query параметрах

  // Обработчик для кнопки
  const handleSearchCheck = useCallback(() => {
    // Валидация локальных значений
    if (!isValidOrderId(orderId)) {
      setError("Некорректный номер заказа");
      return;
    }

    if (!isValidEmail(email)) {
      setError("Некорректный email");
      return;
    }

    // Обновляем URL
    router.push(
      {
        pathname: router.pathname,
        query: { orderId, email },
      },
      undefined,
      { shallow: true }
    );
  }, [orderId, email, router]);

  return (
    <PublicLayout>
      <Container maxWidth="md" sx={{ my: 4 }}>
        <Typography variant="h4" gutterBottom>
          Текуший статус заявки
        </Typography>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Номер заказа"
                value={orderId || ""}
                onChange={(e) => setOrderId(e.target.value)}
                error={!!orderId && !isValidOrderId(orderId)}
                helperText={!!orderId && !isValidOrderId(orderId) && "Должен содержать только цифры"}
              />
            </Grid>

            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                type="email"
                value={email || ""}
                onChange={(e) => setEmail(e.target.value)}
                error={!!email && !isValidEmail(email)}
                helperText={!!email && !isValidEmail(email) && "Некорректный формат email"}
              />
            </Grid>

            <Grid item xs={12} sx={{ textAlign: "center" }}>
              <Button
                variant="contained"
                onClick={handleSearchCheck} // Используем новый обработчик
                disabled={loading || !orderId || !email}
                startIcon={loading ? <CircularProgress size={20} /> : null}
              >
                {loading ? "Загрузка..." : "Проверить статус"}
              </Button>
            </Grid>
          </Grid>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {order && (
          <Paper sx={{ p: 3 }}>
            <Grid container spacing={3}>
              <Grid item xs={12}>
                {order.status === "NEW" && (
                  <Typography variant="h4" gutterBottom>
                    Заявка была успешно создана!
                  </Typography>
                )}

                <Typography variant="h6" gutterBottom>
                  Заявка #{order.id}
                </Typography>
                <Chip
                  label={statusConfig[order.status].label}
                  color={statusConfig[order.status].color}
                  icon={statusConfig[order.status].icon}
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary">
                  Дата создания: {new Date(order.createdAt).toLocaleDateString("ru-RU")}
                </Typography>
              </Grid>

              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  Состав заявки:
                </Typography>
                <List>
                  {order.products.map(({ product, quantity }) => (
                    <ListItem key={product.id} divider sx={{ py: 2 }}>
                      <Grid container spacing={2} alignItems="center">
                        <Grid item xs={3} sm={2}>
                          {product.image ? (
                            <Image
                              src={product.image}
                              alt={product.name}
                              width={100}
                              height={100}
                              style={{ objectFit: "contain" }}
                            />
                          ) : (
                            <Box
                              sx={{
                                width: 100,
                                height: 100,
                                bgcolor: "grey.100",
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                            >
                              <Typography variant="caption">Нет изображения</Typography>
                            </Box>
                          )}
                        </Grid>

                        <Grid item xs={6} sm={8}>
                          <ListItemText
                            primary={product.name}
                            secondary={
                              <span>
                                <Typography component="span" variant="body2" display="block">
                                  Артикул: {product.article}
                                </Typography>
                                <Typography component="span" variant="body2" display="block">
                                  {product.description}
                                </Typography>
                              </span>
                            }
                          />
                        </Grid>

                        <Grid item xs={3} sm={2}>
                          <Typography variant="body1" align="right">
                            {quantity} × {product.price.toLocaleString("ru-RU")} ₽
                          </Typography>
                          <Typography variant="h6" align="right">
                            {(quantity * product.price).toLocaleString("ru-RU")} ₽
                          </Typography>
                        </Grid>
                      </Grid>
                    </ListItem>
                  ))}
                </List>
              </Grid>

              <Grid item xs={12} sx={{ textAlign: "right" }}>
                <Typography variant="h5" sx={{ fontWeight: 700 }}>
                  Итого:{" "}
                  {order.products
                    .reduce((sum, { quantity, product }) => sum + quantity * product.price, 0)
                    .toLocaleString("ru-RU")}{" "}
                  ₽
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        )}
      </Container>
    </PublicLayout>
  );
}
