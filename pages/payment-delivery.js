import PublicLayout from "@/components/layouts/PublicLayout";
import {
  Box,
  Typography,
  Link,
  Grid,
  useTheme,
  useMediaQuery,
  Breadcrumbs,
  Container,
  Avatar,
  Stack,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import {
  CreditCard,
  LocalShipping,
  AccountBalanceWallet,
  Redeem,
  Schedule,
  LocationOn,
  WarningAmber,
} from "@mui/icons-material";

const paymentMethods = [
  {
    icon: <CreditCard fontSize="large" />,
    title: "Банковской картой",
    details: "Visa, Mastercard, Мир - оплата после оформления заказа",
  },
  {
    icon: <AccountBalanceWallet fontSize="large" />,
    title: "Наложенный платеж",
    details: "Оплата при получении в пункте выдачи СДЭК",
  },
  {
    icon: <Redeem fontSize="large" />,
    title: "Юридическим лицам",
    details: "Безналичный расчет по счету с НДС",
  },
];

const deliveryOptions = [
  {
    icon: <LocalShipping fontSize="large" />,
    title: "Курьерская доставка",
    time: "1-3 дня",
    price: "от 300 ₽",
    area: "По всему ДВО",
  },
  {
    icon: <LocationOn fontSize="large" />,
    title: "Самовывоз",
    time: "Сегодня",
    price: "Бесплатно",
    area: "Наш склад в Благовещенске",
  },
  {
    icon: <Schedule fontSize="large" />,
    title: "Экспресс-доставка",
    time: "24 часа",
    price: "от 1500 ₽",
    area: "В пределах Благовещенска",
  },
];

export default function PaymentDeliveryPage() {
  return (
    <PublicLayout>
      <Container maxWidth="xl">
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link href="/" color="inherit" underline="hover" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Главная
          </Link>
          <Typography color="text.primary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Оплата и доставка
          </Typography>
        </Breadcrumbs>

        <Typography
          variant="h4"
          component="h1"
          gutterBottom
          sx={{
            mb: 4,
            fontSize: { xs: "1.5rem", sm: "2rem" },
            textAlign: "center",
          }}
        >
          Условия оплаты и доставки
        </Typography>

        {/* Секция способов оплаты */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
            Способы оплаты
          </Typography>

          <Grid container spacing={4}>
            {paymentMethods.map((method, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Stack
                  alignItems="center"
                  sx={{
                    p: 3,
                    height: "100%",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    textAlign: "center",
                    "&:hover": {
                      boxShadow: 2,
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: "primary.main",
                      mb: 2,
                    }}
                  >
                    {method.icon}
                  </Avatar>
                  <Typography variant="h6" gutterBottom>
                    {method.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {method.details}
                  </Typography>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Секция вариантов доставки */}
        <Box sx={{ mb: 6 }}>
          <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4 }}>
            Варианты доставки
          </Typography>

          <Grid container spacing={4}>
            {deliveryOptions.map((option, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Stack
                  spacing={2}
                  sx={{
                    p: 3,
                    height: "100%",
                    border: 1,
                    borderColor: "divider",
                    borderRadius: 2,
                    "&:hover": {
                      boxShadow: 2,
                      borderColor: "primary.main",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                    <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>{option.icon}</Avatar>
                    <Typography variant="h6">{option.title}</Typography>
                  </Box>

                  <List dense>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <Schedule fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={`Сроки: ${option.time}`} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <CreditCard fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={`Стоимость: ${option.price}`} />
                    </ListItem>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <LocationOn fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={option.area} />
                    </ListItem>
                  </List>
                </Stack>
              </Grid>
            ))}
          </Grid>
        </Box>

        {/* Дополнительная информация */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <WarningAmber color="warning" /> Важно!
              </Typography>
              <List dense>
                <ListItem disableGutters>
                  <ListItemText
                    primary="• Полная предоплата требуется для заказов свыше 50 000 ₽"
                    secondary="Для юр. лиц доступен отсрочка платежа"
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemText
                    primary="• Проверяйте комплектацию при получении"
                    secondary="Претензии по недостаче принимаются только при вскрытии в присутствии курьера"
                  />
                </ListItem>
              </List>
            </Box>
          </Grid>

          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                border: 1,
                borderColor: "divider",
              }}
            >
              <Typography variant="h6" gutterBottom>
                Как отследить заказ?
              </Typography>
              <Typography variant="body2" paragraph>
                1. После отправки вы получите SMS с трек-номером
                <br />
                2. Используйте трек-номер на сайте <Link href="https://cdek.ru">cdek.ru</Link>
                <br />
                3. Для юридических лиц: менеджер предоставит транспортную накладную
              </Typography>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
}
