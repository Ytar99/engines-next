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
  Alert,
} from "@mui/material";
import { Schedule, Warning, AccessTime, CalendarToday } from "@mui/icons-material";

const schedule = [
  { day: "Понедельник", time: "9:00 - 18:00" },
  { day: "Вторник", time: "9:00 - 18:00" },
  { day: "Среда", time: "9:00 - 18:00" },
  { day: "Четверг", time: "9:00 - 18:00" },
  { day: "Пятница", time: "9:00 - 18:00" },
  { day: "Суббота", time: "10:00 - 15:00" },
  { day: "Воскресенье", time: "Выходной" },
];

const specialDays = [
  { date: "1 января", description: "Новогодние праздники" },
  { date: "8 марта", description: "Сокращенный день до 14:00" },
  { date: "9 мая", description: "Выходной день" },
];

export default function WorkingHoursPage() {
  return (
    <PublicLayout>
      <Container maxWidth="xl">
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link href="/" color="inherit" underline="hover" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Главная
          </Link>
          <Typography color="text.primary" sx={{ fontSize: { xs: "0.875rem", sm: "1rem" } }}>
            Режим работы
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
          Режим работы компании
        </Typography>

        <Grid container spacing={4}>
          {/* Основной график работы */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: "primary.main" }}>
                  <Schedule />
                </Avatar>
                <Typography variant="h5">Основной график</Typography>
              </Box>

              <List dense>
                {schedule.map((item, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <CalendarToday color="primary" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.day}
                      secondary={item.time}
                      sx={{
                        "& .MuiListItemText-secondary": {
                          color: item.time === "Выходной" ? "error.main" : "text.secondary",
                        },
                      }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          {/* Особые даты */}
          <Grid item xs={12} md={6}>
            <Box
              sx={{
                p: 3,
                bgcolor: "background.paper",
                borderRadius: 2,
                boxShadow: 1,
                height: "100%",
              }}
            >
              <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 3 }}>
                <Avatar sx={{ bgcolor: "warning.main" }}>
                  <Warning />
                </Avatar>
                <Typography variant="h5">Особые даты</Typography>
              </Box>

              <List dense>
                {specialDays.map((item, index) => (
                  <ListItem key={index} disableGutters>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Warning color="warning" />
                    </ListItemIcon>
                    <ListItemText
                      primary={item.date}
                      secondary={item.description}
                      sx={{ "& .MuiListItemText-secondary": { color: "text.secondary" } }}
                    />
                  </ListItem>
                ))}
              </List>
            </Box>
          </Grid>

          {/* Дополнительная информация */}
          <Grid item xs={12}>
            <Grid container spacing={3}>
              <Grid item xs={12} md={6}>
                <Alert
                  severity="info"
                  icon={<AccessTime fontSize="large" />}
                  sx={{
                    "& .MuiAlert-message": { width: "100%" },
                    alignItems: "center",
                  }}
                >
                  <Typography variant="body1" gutterBottom>
                    Обеденный перерыв:
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Ежедневно с 13:00 до 14:00
                  </Typography>
                </Alert>
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
                  <Typography variant="body1" gutterBottom>
                    В праздничные дни режим работы может меняться.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Рекомендуем уточнять время работы по телефону:
                    <Box component="span" sx={{ ml: 1, fontWeight: 500, color: "primary.main" }}>
                      +7 (4162) 123-456
                    </Box>
                  </Typography>
                </Box>
              </Grid>
            </Grid>
          </Grid>
        </Grid>
      </Container>
    </PublicLayout>
  );
}
