// pages/crm/dashboard.js
import { useEffect, useState } from "react";
import { Box, Grid, Card, CardContent, Typography, CircularProgress, Alert } from "@mui/material";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip } from "recharts";
import CrmLayout from "@/components/layouts/CrmLayout";
import apiClient from "@/lib/api/client";
import { STATUS_OPTIONS_OBJ } from "@/lib/constants/order";

const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#8884d8"];

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes] = await Promise.all([
          apiClient.get("/crm/dashboard/stats"),
          apiClient.get("/crm/dashboard/orders-by-status"),
        ]);

        const processedOrders = ordersRes.map((item) => ({
          name: STATUS_OPTIONS_OBJ[item.status] || item.status,
          value: item.count,
        }));

        setStats({
          totals: statsRes,
          ordersByStatus: processedOrders,
        });
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <CircularProgress sx={{ mt: 4 }} />;
  if (error) return <Alert severity="error">{error}</Alert>;

  return (
    <CrmLayout>
      <Box sx={{ flexGrow: 1, p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Аналитическая панель
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Всего заказов</Typography>
                <Typography variant="h4">{stats.totals.totalOrders}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Выручка</Typography>
                <Typography variant="h4">
                  {new Intl.NumberFormat("ru-RU", {
                    style: "currency",
                    currency: "RUB",
                  }).format(stats.totals.totalRevenue)}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Покупатели</Typography>
                <Typography variant="h4">{stats.totals.totalCustomers}</Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary">Товары</Typography>
                <Typography variant="h4">{stats.totals.totalProducts}</Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={3}>
          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Распределение заказов по статусам
              </Typography>
              <PieChart width={400} height={300}>
                <Pie
                  data={stats.ordersByStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                  nameKey="name"
                  label
                >
                  {stats.ordersByStatus.map((entry, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </Card>
          </Grid>

          <Grid item xs={12} md={6}>
            <Card sx={{ p: 2 }}>
              <Typography variant="h6" gutterBottom>
                Выручка по дням (последние 7 дней)
              </Typography>
              <BarChart width={500} height={300} data={stats.totals.revenueLast7Days}>
                <XAxis dataKey="date" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="amount" fill="#8884d8" />
              </BarChart>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </CrmLayout>
  );
}

export const getServerSideProps = async (props) => {
  return {
    props: {},
  };
};
