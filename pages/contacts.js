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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
} from "@mui/material";
import { LocationOn, Phone, Email, Schedule, Warning, Public } from "@mui/icons-material";

const contactInfo = [
  {
    icon: <LocationOn fontSize="large" />,
    title: "Основной склад",
    details: "г. Благовещенск, микрорайон КПП, Кольцевая улица, 39/1",
    additional: "303 офис, 3 этаж",
  },
  {
    icon: <Phone fontSize="large" />,
    title: "Телефоны",
    details: [
      { label: "Отдел продаж", value: "+7 (914) 578-52-02" },
      { label: "Сервисный центр", value: "+7 (924) 448-27-28" },
    ],
  },
  {
    icon: <Email fontSize="large" />,
    title: "Электронная почта",
    details: [
      { label: "Общие вопросы", value: "info@autodvs.ru" },
      { label: "Техподдержка", value: "support@autodvs.ru" },
    ],
  },
  {
    icon: <Schedule fontSize="large" />,
    title: "Режим работы",
    details: [
      { label: "Пн-Пт", value: "9:00 - 17:00" },
      { label: "Сб-Вс", value: "Выходной" },
    ],
  },
];

export default function ContactsPage() {
  return (
    <PublicLayout>
      <Container maxWidth="xl">
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link href="/" color="inherit" underline="hover" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Главная
          </Link>
          <Typography color="text.primary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Контакты
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
          Наши контакты
        </Typography>

        {/* Основная контактная информация */}
        <Grid container spacing={4} sx={{ mb: 6 }}>
          {contactInfo.map((item, index) => (
            <Grid item xs={12} sm={6} md={3} key={index}>
              <Box
                sx={{
                  p: 3,
                  height: "100%",
                  border: 1,
                  borderColor: "divider",
                  borderRadius: 2,
                  backgroundColor: "background.paper",
                }}
              >
                <Box sx={{ display: "flex", alignItems: "center", mb: 2, gap: 2 }}>
                  <Avatar sx={{ bgcolor: "primary.main", width: 40, height: 40 }}>{item.icon}</Avatar>
                  <Typography variant="h6">{item.title}</Typography>
                </Box>

                {Array.isArray(item.details) ? (
                  <List dense>
                    {item.details.map((detail, idx) => (
                      <ListItem key={idx} disableGutters>
                        <ListItemText
                          primary={detail.value}
                          secondary={detail.label}
                          sx={{ "& .MuiListItemText-secondary": { mt: 0.5 } }}
                        />
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <>
                    <Typography variant="body1" paragraph>
                      {item.details}
                    </Typography>
                    {item.additional && (
                      <Typography variant="body2" color="text.secondary">
                        {item.additional}
                      </Typography>
                    )}
                  </>
                )}
              </Box>
            </Grid>
          ))}
        </Grid>

        {/* Карта и дополнительные сведения */}
        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Box
              sx={{
                height: 400,
                borderRadius: 2,
                overflow: "hidden",
                position: "relative",
                bgcolor: "background.default",
              }}
            >
              <iframe
                title="Карта расположения"
                src="https://yandex.ru/map-widget/v1/?um=constructor%3Ad398f3a4bf4eda653dea64b6d99e8421b61e15f2660ad7dff5f0d8d83bfdd5d7&amp;source=constructor"
                width="100%"
                height="100%"
                frameBorder="0"
              />
              {/* <Chip
                icon={<Public />}
                label="Открыть в Яндекс.Картах"
                component="a"
                href="https://yandex.ru/maps/?pt=50.303973,127.546137&z=15"
                target="_blank"
                rel="noopener"
                sx={{
                  position: "absolute",
                  bottom: 16,
                  left: 16,
                  bgcolor: "background.paper",
                }}
                clickable
              /> */}
            </Box>
          </Grid>

          <Grid item xs={12} md={4}>
            <Box
              sx={{
                p: 3,
                height: "100%",
                border: 1,
                borderColor: "divider",
                borderRadius: 2,
                backgroundColor: "background.paper",
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                <Warning color="warning" /> Важная информация
              </Typography>
              <List dense>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Phone fontSize="small" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Предварительная запись"
                    secondary="Для посещения склада необходимо согласовать время визита"
                  />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <LocationOn fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Парковка" secondary="Бесплатная парковка для клиентов" />
                </ListItem>
                <ListItem disableGutters>
                  <ListItemIcon sx={{ minWidth: 32 }}>
                    <Schedule fontSize="small" />
                  </ListItemIcon>
                  <ListItemText primary="Обеденный перерыв" secondary="13:00 - 14:00 ежедневно" />
                </ListItem>
              </List>
            </Box>
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
}
