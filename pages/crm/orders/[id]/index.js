import { useRouter } from "next/router";
import {
  Typography,
  Button,
  Box,
  Grid,
  Card,
  CardContent,
  Chip,
  Link,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Breadcrumbs,
  Alert,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CrmLayout from "@/components/layouts/CrmLayout";
import prisma from "@/lib/prisma";
import { formatDate, formatCurrency, formatPhone } from "@/lib/utils/formatter";
import { STATUS_COLORS, STATUS_OPTIONS_OBJ } from "@/lib/constants/order";

export default function OrderDetailsPage({ orderData }) {
  const router = useRouter();

  if (!orderData) return null;

  const totalAmount = orderData.products.reduce((sum, item) => sum + item.product.price * item.count, 0);

  return (
    <CrmLayout>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/crm" sx={{ display: "flex", alignItems: "center" }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            CRM
          </Link>
          <Link color="inherit" href="/crm/orders">
            Заявки
          </Link>
          <Typography color="text.primary">Заявка #{orderData.id}</Typography>
        </Breadcrumbs>

        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1">
              Заявка #{orderData.id}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {formatDate(orderData.createdAt)}
            </Typography>
          </Grid>
          <Grid item sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
              Назад
            </Button>
            <Button variant="contained" startIcon={<EditIcon />} onClick={() => router.push(`/crm/orders/${id}/edit`)}>
              Редактировать
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Order Info */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined" sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>

              <Box sx={{ "& > div": { mb: 1.5 } }}>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Typography>
                    <strong>Статус:</strong>{" "}
                  </Typography>
                  <Chip
                    size="small"
                    label={STATUS_OPTIONS_OBJ[orderData.status] || orderData.status}
                    color={STATUS_COLORS[orderData.status] || "default"}
                  />
                </Box>

                <Typography>
                  <strong>Покупатель:</strong>{" "}
                  <Link href={`/crm/customers/${orderData.customer.id}`} underline="hover">
                    {orderData.customer.firstname || "Безымянный"} {orderData.customer.lastname}
                  </Link>
                </Typography>

                <Typography>
                  <strong>Email:</strong> {orderData.customer.email}
                </Typography>

                {orderData.customer.phone && (
                  <Typography>
                    <strong>Телефон:</strong> {formatPhone(orderData.customer.phone)}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>

          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Финансовая информация
              </Typography>

              <Table size="small">
                <TableBody>
                  <TableRow>
                    <TableCell>Товаров:</TableCell>
                    <TableCell align="right">{orderData.products.length}</TableCell>
                  </TableRow>
                  <TableRow>
                    <TableCell>Общая сумма:</TableCell>
                    <TableCell align="right">{formatCurrency(totalAmount)}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </Grid>

        {/* Products */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Состав заявки
              </Typography>

              {orderData.products.length === 0 ? (
                <Alert severity="info">Нет товаров в заявке</Alert>
              ) : (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Товар</TableCell>
                      <TableCell>Цена</TableCell>
                      <TableCell>Количество</TableCell>
                      <TableCell align="right">Сумма</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orderData.products.map((item) => (
                      <TableRow key={item.product.id}>
                        <TableCell>
                          <Link href={`/crm/products/${item.product.id}/edit`} target="_blank" underline="hover">
                            {item.product.name}
                          </Link>
                          <Typography variant="body2" color="text.secondary">
                            Артикул: {item.product.article}
                          </Typography>
                        </TableCell>
                        <TableCell>{formatCurrency(item.product.price)}</TableCell>
                        <TableCell>{item.count}</TableCell>
                        <TableCell align="right">{formatCurrency(item.product.price * item.count)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
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
        orderData: JSON.parse(JSON.stringify(order)),
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
