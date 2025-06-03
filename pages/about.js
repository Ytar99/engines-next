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
} from "@mui/material";
import { History, LocalShipping, Groups, Engineering } from "@mui/icons-material";

const features = [
  {
    icon: <LocalShipping fontSize="large" />,
    title: "Быстрая доставка",
    text: "Отправка заказов по всей России",
  },
  {
    icon: <Engineering fontSize="large" />,
    title: "Оригинальные запчасти",
    text: "Работаем только с проверенными поставщиками",
  },
  {
    icon: <Groups fontSize="large" />,
    title: "Профессиональная поддержка",
    text: "Консультации технических специалистов",
  },
  {
    icon: <History fontSize="large" />,
    title: "Опыт работы",
    text: "Более 15 лет на рынке автозапчастей",
  },
];

export default function AboutPage() {
  return (
    <PublicLayout>
      <Container maxWidth="xl">
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link href="/" color="inherit" underline="hover" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Главная
          </Link>
          <Typography color="text.primary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            О компании
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
          О компании АвтоДВС
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          <Grid item xs={12} md={6}>
            <Typography variant="body1" paragraph sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}>
              Компания АвтоДВС - поставщик автозапчастей для частного и коммерческого транспорта в Дальневосточном
              регионе. Мы специализируемся на комплектации двигателей и трансмиссий для автомобилей и спецтехники.
            </Typography>
            <Typography variant="body1" paragraph sx={{ fontSize: { xs: "1rem", sm: "1.1rem" } }}>
              Наш складской комплекс содержит несколько сотен наименований запчастей, что позволяет оперативно
              комплектовать заказы любой сложности.
            </Typography>
          </Grid>
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                height: { xs: 300, md: 400 },
                borderRadius: 2,
                overflow: "hidden",
                background: "url(/images/about-warehouse.jpg) center/cover",
                boxShadow: 3,
              }}
            />
          </Grid>
        </Grid>

        <Typography variant="h5" component="h2" gutterBottom sx={{ mb: 4, textAlign: "center" }}>
          Наши преимущества
        </Typography>

        <Grid container spacing={4} sx={{ mb: 6 }}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
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
                  {feature.icon}
                </Avatar>
                <Typography variant="h6" gutterBottom>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.text}
                </Typography>
              </Stack>
            </Grid>
          ))}
        </Grid>

        <Box
          sx={{
            p: 4,
            borderRadius: 2,
            bgcolor: "background.paper",
            boxShadow: 1,
          }}
        >
          <Typography variant="h5" component="h3" gutterBottom sx={{ mb: 3 }}>
            Наша миссия
          </Typography>
          <Typography variant="body1" sx={{ maxWidth: 800, mx: "auto" }}>
            Обеспечивать профессиональных клиентов качественными автомобильными компонентами, предлагая оптимальные
            технические решения и выстраивая долгосрочные партнерские отношения на основе взаимного доверия и
            прозрачности бизнес-процессов.
          </Typography>
        </Box>
      </Container>
    </PublicLayout>
  );
}
