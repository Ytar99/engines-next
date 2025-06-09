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
  Skeleton,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Breadcrumbs,
} from "@mui/material";
import EditIcon from "@mui/icons-material/Edit";
import HomeIcon from "@mui/icons-material/Home";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CrmLayout from "@/components/layouts/CrmLayout";
import prisma from "@/lib/prisma";
import { formatDate, formatPhone } from "@/lib/utils/formatter";
import { useCustomerOrders } from "@/lib/hooks/useCustomerOrder";
import { STATUS_OPTIONS_OBJ } from "@/lib/constants/order";

export default function CustomerDetailsPage({ customerData }) {
  const router = useRouter();
  const { id } = router.query;
  const { orders, loading, error, isEmpty } = useCustomerOrders(id);

  if (!customerData) return null;

  return (
    <CrmLayout>
      <Box sx={{ mb: 4 }}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link color="inherit" href="/crm" sx={{ display: "flex", alignItems: "center" }}>
            <HomeIcon sx={{ mr: 0.5 }} fontSize="inherit" />
            CRM
          </Link>
          <Link color="inherit" href="/crm/customers">
            Клиенты
          </Link>
          <Typography color="text.primary"> #{customerData.id}</Typography>
        </Breadcrumbs>

        <Grid container justifyContent="space-between" alignItems="center">
          <Grid item>
            <Typography variant="h4" component="h1">
              {customerData.firstname || "Безымянный покупатель"} {customerData.lastname}
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              ID: {customerData.id}
            </Typography>
          </Grid>
          <Grid item sx={{ display: "flex", gap: 2 }}>
            <Button variant="outlined" startIcon={<ArrowBackIcon />} onClick={() => router.back()}>
              Назад
            </Button>
            <Button
              variant="contained"
              startIcon={<EditIcon />}
              onClick={() => router.push(`/crm/customers/${id}/edit`)}
            >
              Редактировать
            </Button>
          </Grid>
        </Grid>
      </Box>

      <Grid container spacing={3}>
        {/* Customer Info Section */}
        <Grid item xs={12} md={4}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Основная информация
              </Typography>
              <Box sx={{ "& > div": { mb: 1 } }}>
                <Typography>
                  <strong>Email:</strong> {customerData.email}
                </Typography>
                {customerData.phone && (
                  <Typography>
                    <strong>Телефон:</strong> {formatPhone(customerData.phone)}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Создан: {formatDate(customerData.createdAt)}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Обновлен: {formatDate(customerData.updatedAt)}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* Orders Section */}
        <Grid item xs={12} md={8}>
          <Card variant="outlined">
            <CardContent>
              <Typography variant="h6" gutterBottom>
                История заявок
              </Typography>

              {loading && <Skeleton variant="rectangular" height={200} />}

              {error && (
                <Typography color="error" sx={{ p: 2 }}>
                  Ошибка загрузки заявок: {error}
                </Typography>
              )}

              {isEmpty && (
                <Typography color="text.secondary" sx={{ p: 2 }}>
                  Нет заявок
                </Typography>
              )}

              {!loading && !error && !isEmpty && (
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>ID заявки</TableCell>
                      <TableCell>Статус</TableCell>
                      <TableCell>Дата</TableCell>
                      <TableCell>Товаров</TableCell>
                      <TableCell align="right">Действия</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell>#{order.id}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={STATUS_OPTIONS_OBJ[order.status]?.label || order.status}
                            color={STATUS_OPTIONS_OBJ[order.status]?.color || "default"}
                            sx={{ width: "100%" }}
                          />
                        </TableCell>
                        <TableCell>{formatDate(order.createdAt)}</TableCell>
                        <TableCell>{order.products.length}</TableCell>
                        <TableCell align="right">
                          <Link
                            href={`/crm/orders/${order.id}`}
                            color="primary"
                            underline="hover"
                            sx={{ cursor: "pointer" }}
                          >
                            Подробнее
                          </Link>
                        </TableCell>
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
    const customer = await prisma.customer.findUnique({
      where: { id: parseInt(id) },
    });

    if (!customer) {
      throw new Error("Покупатель не найден");
    }

    return {
      props: {
        customerData: JSON.parse(JSON.stringify(customer)),
      },
    };
  } catch (error) {
    console.error("Error fetching customer:", error);
    return {
      redirect: {
        destination: "/crm/customers?error=EntityNotFound",
        permanent: false,
      },
    };
  }
}
