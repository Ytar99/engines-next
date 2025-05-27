import PublicLayout from "@/components/layouts/PublicLayout";
import {
  Box,
  Typography,
  Link,
  Breadcrumbs,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
  useTheme,
} from "@mui/material";
import PrivacyTipIcon from "@mui/icons-material/PrivacyTip";
import { useRef } from "react";

const sections = [
  {
    id: "general",
    title: "1. Общие положения",
    content: `Настоящая Политика конфиденциальности регулирует порядок обработки и использования персональных данных...`,
  },
  {
    id: "data-collection",
    title: "2. Сбор персональных данных",
    content: `Мы собираем информацию, которую вы предоставляете при регистрации, оформлении заказа...`,
  },
  {
    id: "data-usage",
    title: "3. Использование информации",
    content: `Собранные данные используются для обработки заказов, улучшения качества обслуживания...`,
  },
  {
    id: "data-protection",
    title: "4. Защита данных",
    content: `Мы применяем современные методы шифрования и защиты информации...`,
  },
  {
    id: "user-rights",
    title: "5. Права пользователей",
    content: `Вы имеете право запросить доступ, исправление или удаление ваших персональных данных...`,
  },
  {
    id: "cookies",
    title: "6. Использование Cookies",
    content: `Сайт использует файлы cookie для персонализации контента и анализа трафика...`,
  },
];

export default function PrivacyPolicyPage() {
  const theme = useTheme();
  const contentRef = useRef(null);

  return (
    <PublicLayout>
      <Container maxWidth="xl" ref={contentRef}>
        <Breadcrumbs aria-label="breadcrumb" sx={{ mb: 2 }}>
          <Link href="/" color="inherit" underline="hover">
            Главная
          </Link>
          <Typography color="text.primary">Политика конфиденциальности</Typography>
        </Breadcrumbs>

        <Box sx={{ display: "flex", alignItems: "center", gap: 2, mb: 4 }}>
          <PrivacyTipIcon fontSize="large" color="primary" />
          <Typography
            variant="h4"
            component="h1"
            sx={{
              fontSize: { xs: "1.5rem", sm: "2rem" },
              color: theme.palette.text.primary,
            }}
          >
            Политика конфиденциальности
          </Typography>
        </Box>

        {/* Оглавление */}
        <Box
          sx={{
            p: 3,
            mb: 4,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          <Typography variant="h6" gutterBottom>
            Содержание
          </Typography>
          <List dense>
            {sections.map((section, index) => (
              <ListItem
                key={index}
                component="a"
                href={`#${section.id}`}
                sx={{
                  color: "primary.main",
                  textDecoration: "none",
                  "&:hover": { textDecoration: "underline" },
                }}
              >
                <ListItemText primary={section.title} primaryTypographyProps={{ variant: "body2" }} />
              </ListItem>
            ))}
          </List>
        </Box>

        {/* Основное содержание */}
        <Box
          sx={{
            p: { xs: 2, sm: 3 },
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          {sections.map((section, index) => (
            <Box key={section.id} sx={{ mb: 4 }} id={section.id}>
              <Typography
                variant="h5"
                component="h2"
                sx={{
                  mb: 2,
                  fontSize: "1.25rem",
                  fontWeight: 500,
                  color: theme.palette.primary.main,
                }}
              >
                {section.title}
              </Typography>
              <Typography
                variant="body1"
                paragraph
                sx={{
                  textAlign: "justify",
                  lineHeight: 1.6,
                  color: theme.palette.text.secondary,
                }}
              >
                {section.content}
              </Typography>
              {index < sections.length - 1 && <Divider sx={{ my: 3 }} />}
            </Box>
          ))}

          {/* Контактная информация */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
            }}
          >
            <Typography variant="h6" gutterBottom>
              Контактная информация
            </Typography>
            <Typography variant="body2" paragraph>
              По вопросам обработки персональных данных обращайтесь:
            </Typography>
            <List dense>
              <ListItem disableGutters>
                <ListItemText
                  primary="Электронная почта:"
                  secondary="privacy@autodvs.ru"
                  secondaryTypographyProps={{ color: "primary.main" }}
                />
              </ListItem>
              <ListItem disableGutters>
                <ListItemText primary="Почтовый адрес:" secondary="г. Благовещенск, ул. Промышленная, 28" />
              </ListItem>
            </List>
          </Box>

          {/* Дата и подпись */}
          <Box
            sx={{
              mt: 4,
              pt: 3,
              borderTop: 1,
              borderColor: "divider",
              textAlign: "right",
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Дата вступления в силу: 01.01.2024
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {`ООО "АвтоДВС"`}
            </Typography>
          </Box>
        </Box>
      </Container>
    </PublicLayout>
  );
}
